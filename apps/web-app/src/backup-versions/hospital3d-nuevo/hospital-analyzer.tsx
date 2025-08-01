'use client'
import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Tipos para el análisis
interface MaterialInfo {
  name: string
  type: string
  color?: string
  map?: {
    name: string
    size: { width: number; height: number }
    format: string
  }
  transparent: boolean
  opacity: number
  metalness?: number
  roughness?: number
}

interface MeshInfo {
  name: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  vertices: number
  faces: number
  material: MaterialInfo
  boundingBox: {
    min: [number, number, number]
    max: [number, number, number]
    size: [number, number, number]
  }
  visible: boolean
  castShadow: boolean
  receiveShadow: boolean
}

interface ModelAnalysis {
  totalMeshes: number
  totalVertices: number
  totalFaces: number
  materials: MaterialInfo[]
  meshes: MeshInfo[]
  sceneSize: {
    min: [number, number, number]
    max: [number, number, number]
    center: [number, number, number]
    dimensions: [number, number, number]
  }
  textureMemoryUsage: number
  recommendations: string[]
}

// Componente para analizar el hospital
function HospitalAnalyzer({ onAnalysisComplete }: { onAnalysisComplete: (analysis: ModelAnalysis) => void }) {
  const { scene } = useGLTF('/models/hospital-lod0.glb')
  const analyzedRef = useRef(false)

  useEffect(() => {
    if (scene && !analyzedRef.current) {
      analyzedRef.current = true
      
      const analysis: ModelAnalysis = {
        totalMeshes: 0,
        totalVertices: 0,
        totalFaces: 0,
        materials: [],
        meshes: [],
        sceneSize: {
          min: [Infinity, Infinity, Infinity],
          max: [-Infinity, -Infinity, -Infinity],
          center: [0, 0, 0],
          dimensions: [0, 0, 0]
        },
        textureMemoryUsage: 0,
        recommendations: []
      }

      // Mapas para evitar duplicados
      const materialMap = new Map<string, MaterialInfo>()
      const textureMap = new Map<string, any>()

      // Calcular bounding box de toda la escena
      const box = new THREE.Box3().setFromObject(scene)
      analysis.sceneSize.min = [box.min.x, box.min.y, box.min.z]
      analysis.sceneSize.max = [box.max.x, box.max.y, box.max.z]
      analysis.sceneSize.center = [
        (box.min.x + box.max.x) / 2,
        (box.min.y + box.max.y) / 2,
        (box.min.z + box.max.z) / 2
      ]
      analysis.sceneSize.dimensions = [
        box.max.x - box.min.x,
        box.max.y - box.min.y,
        box.max.z - box.min.z
      ]

      // Recorrer todos los objetos de la escena
      scene.traverse((child) => {
        if (child.isMesh) {
          analysis.totalMeshes++

          // Información del mesh
          const geometry = child.geometry
          const material = child.material

          // Contar vértices y caras
          const vertexCount = geometry.attributes.position?.count || 0
          const faceCount = geometry.index ? geometry.index.count / 3 : vertexCount / 3
          analysis.totalVertices += vertexCount
          analysis.totalFaces += faceCount

          // Calcular bounding box del mesh
          geometry.computeBoundingBox()
          const meshBox = geometry.boundingBox!
          
          // Analizar material
          let materialInfo: MaterialInfo
          if (Array.isArray(material)) {
            // Multi-material
            materialInfo = {
              name: `MultiMaterial_${analysis.meshes.length}`,
              type: 'MultiMaterial',
              transparent: false,
              opacity: 1
            }
          } else {
            const matKey = material.uuid
            if (!materialMap.has(matKey)) {
              materialInfo = {
                name: material.name || `Material_${materialMap.size}`,
                type: material.type,
                transparent: material.transparent || false,
                opacity: material.opacity || 1
              }

              // Color del material
              if (material.color) {
                materialInfo.color = `#${material.color.getHexString()}`
              }

              // Propiedades PBR
              if ('metalness' in material) {
                materialInfo.metalness = material.metalness
              }
              if ('roughness' in material) {
                materialInfo.roughness = material.roughness
              }

              // Analizar texturas
              if (material.map) {
                const texture = material.map
                const textureKey = texture.uuid
                
                if (!textureMap.has(textureKey)) {
                  textureMap.set(textureKey, texture)
                  
                  // Calcular uso de memoria de textura
                  const image = texture.image
                  if (image) {
                    const width = image.width || image.videoWidth || 1024
                    const height = image.height || image.videoHeight || 1024
                    const bytesPerPixel = 4 // RGBA
                    const textureMemory = width * height * bytesPerPixel
                    analysis.textureMemoryUsage += textureMemory

                    materialInfo.map = {
                      name: texture.name || 'unnamed_texture',
                      size: { width, height },
                      format: texture.format.toString()
                    }
                  }
                }
              }

              materialMap.set(matKey, materialInfo)
            } else {
              materialInfo = materialMap.get(matKey)!
            }
          }

          // Información del mesh
          const meshInfo: MeshInfo = {
            name: child.name || `Mesh_${analysis.meshes.length}`,
            position: [child.position.x, child.position.y, child.position.z],
            rotation: [child.rotation.x, child.rotation.y, child.rotation.z],
            scale: [child.scale.x, child.scale.y, child.scale.z],
            vertices: vertexCount,
            faces: Math.floor(faceCount),
            material: materialInfo,
            boundingBox: {
              min: [meshBox.min.x, meshBox.min.y, meshBox.min.z],
              max: [meshBox.max.x, meshBox.max.y, meshBox.max.z],
              size: [
                meshBox.max.x - meshBox.min.x,
                meshBox.max.y - meshBox.min.y,
                meshBox.max.z - meshBox.min.z
              ]
            },
            visible: child.visible,
            castShadow: child.castShadow,
            receiveShadow: child.receiveShadow
          }

          analysis.meshes.push(meshInfo)
        }
      })

      // Convertir mapa de materiales a array
      analysis.materials = Array.from(materialMap.values())

      // Generar recomendaciones
      const recommendations: string[] = []

      // Recomendaciones de optimización
      if (analysis.totalVertices > 100000) {
        recommendations.push(`Alto número de vértices (${analysis.totalVertices.toLocaleString()}). Considera usar LOD o simplificar geometría.`)
      }

      if (analysis.textureMemoryUsage > 50 * 1024 * 1024) { // 50MB
        recommendations.push(`Alto uso de memoria de texturas (${(analysis.textureMemoryUsage / 1024 / 1024).toFixed(2)}MB). Considera comprimir o redimensionar texturas.`)
      }

      if (analysis.materials.length > 20) {
        recommendations.push(`Muchos materiales (${analysis.materials.length}). Considera combinar materiales similares.`)
      }

      // Buscar meshes innecesarios
      const smallMeshes = analysis.meshes.filter(mesh => mesh.vertices < 10)
      if (smallMeshes.length > 0) {
        recommendations.push(`${smallMeshes.length} meshes con muy pocos vértices. Considera eliminarlos: ${smallMeshes.map(m => m.name).join(', ')}`)
      }

      // Buscar meshes ocultos
      const hiddenMeshes = analysis.meshes.filter(mesh => !mesh.visible)
      if (hiddenMeshes.length > 0) {
        recommendations.push(`${hiddenMeshes.length} meshes ocultos que se pueden eliminar: ${hiddenMeshes.map(m => m.name).join(', ')}`)
      }

      // Recomendaciones de cámara
      const dimensions = analysis.sceneSize.dimensions
      const maxDimension = Math.max(...dimensions)
      recommendations.push(`Dimensiones del modelo: ${dimensions.map(d => d.toFixed(2)).join(' x ')} unidades`)
      recommendations.push(`Distancia mínima recomendada de cámara: ${(maxDimension * 0.1).toFixed(2)}`)
      recommendations.push(`Distancia máxima recomendada de cámara: ${(maxDimension * 3).toFixed(2)}`)
      recommendations.push(`Posición inicial recomendada: [${(analysis.sceneSize.center[0] + maxDimension).toFixed(2)}, ${(analysis.sceneSize.center[1] + maxDimension * 0.5).toFixed(2)}, ${(analysis.sceneSize.center[2] + maxDimension).toFixed(2)}]`)

      analysis.recommendations = recommendations

      onAnalysisComplete(analysis)
    }
  }, [scene, onAnalysisComplete])

  return <primitive object={scene} />
}

// Componente de visualización del análisis
function AnalysisDisplay({ analysis }: { analysis: ModelAnalysis | null }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'meshes' | 'materials' | 'recommendations'>('overview')
  const [searchTerm, setSearchTerm] = useState('')

  if (!analysis) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  const filteredMeshes = analysis.meshes.filter(mesh =>
    mesh.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const exportAnalysis = () => {
    const dataStr = JSON.stringify(analysis, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = 'hospital-analysis.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Resumen', icon: '📊' },
            { id: 'meshes', name: 'Meshes', icon: '🔧' },
            { id: 'materials', name: 'Materiales', icon: '🎨' },
            { id: 'recommendations', name: 'Recomendaciones', icon: '💡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Botón de exportar */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={exportAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📥 Exportar Análisis JSON
          </button>
        </div>

        {/* Contenido de las tabs */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Total Meshes</h3>
                <p className="text-2xl font-bold text-blue-600">{analysis.totalMeshes}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Total Vértices</h3>
                <p className="text-2xl font-bold text-green-600">{analysis.totalVertices.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Memoria Texturas</h3>
                <p className="text-2xl font-bold text-purple-600">{formatBytes(analysis.textureMemoryUsage)}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Dimensiones del Modelo</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Centro:</span> [{analysis.sceneSize.center.map(v => v.toFixed(2)).join(', ')}]
                </div>
                <div>
                  <span className="font-medium">Dimensiones:</span> {analysis.sceneSize.dimensions.map(v => v.toFixed(2)).join(' × ')}
                </div>
                <div>
                  <span className="font-medium">Mínimo:</span> [{analysis.sceneSize.min.map(v => v.toFixed(2)).join(', ')}]
                </div>
                <div>
                  <span className="font-medium">Máximo:</span> [{analysis.sceneSize.max.map(v => v.toFixed(2)).join(', ')}]
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'meshes' && (
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Buscar meshes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
              />
              <span className="text-sm text-gray-500">{filteredMeshes.length} meshes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vértices</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMeshes.map((mesh, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mesh.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mesh.vertices.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        [{mesh.position.map(v => v.toFixed(1)).join(', ')}]
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mesh.boundingBox.size.map(v => v.toFixed(1)).join(' × ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mesh.material.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          mesh.visible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {mesh.visible ? 'Visible' : 'Oculto'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.materials.map((material, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {material.color && (
                      <div 
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: material.color }}
                      />
                    )}
                    <h3 className="font-semibold">{material.name}</h3>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div><span className="font-medium">Tipo:</span> {material.type}</div>
                    {material.color && <div><span className="font-medium">Color:</span> {material.color}</div>}
                    <div><span className="font-medium">Opacidad:</span> {material.opacity}</div>
                    {material.metalness !== undefined && <div><span className="font-medium">Metalness:</span> {material.metalness}</div>}
                    {material.roughness !== undefined && <div><span className="font-medium">Roughness:</span> {material.roughness}</div>}
                    {material.map && (
                      <div>
                        <span className="font-medium">Textura:</span> {material.map.size.width}x{material.map.size.height}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-yellow-600">💡</span>
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente principal
export default function HospitalAnalyzerPage() {
  const [analysis, setAnalysis] = useState<ModelAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleAnalysisComplete = (analysisData: ModelAnalysis) => {
    setAnalysis(analysisData)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analizador del Hospital 3D</h1>
          <p className="text-gray-600">Análisis completo del modelo hospital-lod0.glb</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vista 3D */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Vista 3D</h2>
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <Canvas
                camera={{ position: [15, 8, 15], fov: 50 }}
                gl={{ antialias: false }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} />
                <OrbitControls enableDamping dampingFactor={0.1} />
                <Suspense fallback={null}>
                  <HospitalAnalyzer onAnalysisComplete={handleAnalysisComplete} />
                </Suspense>
              </Canvas>
            </div>
          </div>

          {/* Análisis */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Análisis del Modelo</h2>
            <AnalysisDisplay analysis={analysis} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Precargar el modelo
useGLTF.preload('/models/hospital-lod0.glb')
