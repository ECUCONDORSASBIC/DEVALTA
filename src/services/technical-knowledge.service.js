/**
 * Servicio de Conocimiento Técnico
 * Proporciona acceso a APIs de conocimiento técnico para agentes especializados
 */

export class TechnicalKnowledgeService {
  constructor() {
    this.apis = {
      stackoverflow: 'https://api.stackexchange.com/2.3/',
      github: 'https://api.github.com/',
      mdn: 'https://developer.mozilla.org/en-US/search.json',
      npm: 'https://registry.npmjs.org/',
      snyk: 'https://api.snyk.io/'
    };
  }
  
  async searchTechnicalSolution(query, tags = []) {
    try {
      const response = await fetch(
        `${this.apis.stackoverflow}/search/advanced?order=desc&sort=votes&q=${encodeURIComponent(query)}&tagged=${tags.join(';')}&site=stackoverflow`
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error buscando solución técnica:', error);
      return [];
    }
  }
  
  async getCodeExamples(language, topic) {
    try {
      const response = await fetch(
        `${this.apis.github}/search/repositories?q=${encodeURIComponent(topic)}+language:${language}&sort=stars&order=desc`
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error obteniendo ejemplos de código:', error);
      return [];
    }
  }
  
  async analyzePackage(packageName) {
    try {
      const response = await fetch(`${this.apis.npm}/${packageName}`);
      const data = await response.json();
      return {
        name: data.name,
        version: data['dist-tags'].latest,
        description: data.description,
        dependencies: data.dependencies || {},
        vulnerabilities: await this.checkVulnerabilities(packageName)
      };
    } catch (error) {
      console.error('Error analizando paquete:', error);
      return null;
    }
  }
  
  async checkVulnerabilities(packageName) {
    // Implementar con Snyk API cuando tengas la API key
    return [];
  }
  
  async searchMDNDocs(query) {
    try {
      const response = await fetch(
        `${this.apis.mdn}?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error('Error buscando en MDN:', error);
      return [];
    }
  }
  
  async getGitHubTrending(language, timeframe = 'daily') {
    try {
      const response = await fetch(
        `${this.apis.github}/search/repositories?q=language:${language}&sort=stars&order=desc&created:>${this.getDateRange(timeframe)}`
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error obteniendo trending repos:', error);
      return [];
    }
  }
  
  getDateRange(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
  }
}
