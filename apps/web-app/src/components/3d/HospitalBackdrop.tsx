'use client'
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface HospitalBackdropProps {
  useSVG?: boolean
  useOptimized?: boolean
}

export function HospitalBackdrop({ useSVG = true, useOptimized = true }: HospitalBackdropProps) {
  const { scene } = useThree()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (useOptimized) {
      // Versión optimizada con gradiente simple y nubes
      createOptimizedBackdrop()
    } else if (useSVG) {
      // Versión con SVG completo
      createSVGBackdrop()
    } else {
      // Versión con gradiente básico
      createBasicBackdrop()
    }
  }, [scene, useSVG, useOptimized])

  const createOptimizedBackdrop = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 2048
    canvas.height = 1024
    
    if (ctx) {
      // Gradiente de cielo profesional
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      skyGradient.addColorStop(0, '#87CEEB')   // Azul cielo claro
      skyGradient.addColorStop(0.5, '#B0E0E6') // Azul cielo medio
      skyGradient.addColorStop(1, '#E0F6FF')   // Azul cielo muy claro
      
      ctx.fillStyle = skyGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Nubes profesionales
      drawClouds(ctx)
      
      // Silueta del hospital (simplificada)
      drawHospitalSilhouette(ctx)
      
      // Crear textura
      const texture = new THREE.CanvasTexture(canvas)
      configureTexture(texture)
      scene.background = texture
    }
  }

  const createSVGBackdrop = () => {
    // Cargar SVG como imagen
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 2048
      canvas.height = 1024
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const texture = new THREE.CanvasTexture(canvas)
        configureTexture(texture)
        scene.background = texture
      }
    }
    img.src = '/textures/hospital-clinicas-background.svg'
  }

  const createBasicBackdrop = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 2048
    canvas.height = 1024
    
    if (ctx) {
      // Gradiente básico
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#87CEEB')
      gradient.addColorStop(1, '#E0F6FF')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const texture = new THREE.CanvasTexture(canvas)
      configureTexture(texture)
      scene.background = texture
    }
  }

  const drawClouds = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    
    // Nube 1
    ctx.beginPath()
    ctx.ellipse(300, 150, 80, 40, 0, 0, 2 * Math.PI)
    ctx.ellipse(380, 150, 60, 30, 0, 0, 2 * Math.PI)
    ctx.ellipse(460, 150, 70, 35, 0, 0, 2 * Math.PI)
    ctx.fill()
    
    // Nube 2
    ctx.beginPath()
    ctx.ellipse(800, 120, 90, 45, 0, 0, 2 * Math.PI)
    ctx.ellipse(880, 120, 70, 35, 0, 0, 2 * Math.PI)
    ctx.fill()
    
    // Nube 3
    ctx.beginPath()
    ctx.ellipse(1400, 180, 85, 42, 0, 0, 2 * Math.PI)
    ctx.ellipse(1480, 180, 65, 32, 0, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawHospitalSilhouette = (ctx: CanvasRenderingContext2D) => {
    // Edificio principal (simplificado)
    ctx.fillStyle = 'rgba(245, 245, 245, 0.9)'
    ctx.fillRect(600, 400, 800, 600)
    
    // Ventanas
    ctx.fillStyle = 'rgba(184, 212, 227, 0.7)'
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 7; col++) {
        ctx.fillRect(650 + col * 100, 450 + row * 120, 60, 80)
      }
    }
    
    // Entrada
    ctx.fillStyle = 'rgba(44, 95, 45, 0.8)'
    ctx.fillRect(950, 850, 100, 150)
    
    // Cruz médica
    ctx.fillStyle = '#FF0000'
    ctx.fillRect(980, 900, 40, 8)
    ctx.fillRect(996, 884, 8, 40)
  }

  const configureTexture = (texture: THREE.CanvasTexture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
  }

  return null
}

// Hook para usar el backdrop
export const useHospitalBackdrop = (options: HospitalBackdropProps = {}) => {
  return <HospitalBackdrop {...options} />
} 