import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface SecurityScanResult {
  scanner: string;
  timestamp: string;
  passed: boolean;
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  scanDuration: number;
}

export interface Vulnerability {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  component?: string;
  version?: string;
  fixedVersion?: string;
  references?: string[];
}

export class SecurityScanner {
  private readonly projectPath: string;
  private readonly outputDir: string;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = projectPath;
    this.outputDir = path.join(projectPath, '.security-reports');
  }

  async ensureOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to create output directory:', error);
    }
  }

  /**
   * Run OWASP Dependency Check scan
   */
  async runOwaspDependencyCheck(): Promise<SecurityScanResult> {
    const startTime = Date.now();
    const outputFile = path.join(this.outputDir, 'dependency-check-report.json');

    try {
      await this.ensureOutputDir();

      // Run OWASP Dependency Check
      const command = `dependency-check --project "AltaMedica" --scan "${this.projectPath}" --format JSON --out "${this.outputDir}" --suppression "${path.join(this.projectPath, '.dependency-check-suppressions.xml')}"`;
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectPath,
        timeout: 300000, // 5 minutes timeout
      });

      // Parse results
      const reportContent = await fs.readFile(outputFile, 'utf-8');
      const report = JSON.parse(reportContent);

      const vulnerabilities: Vulnerability[] = [];
      let summary = { total: 0, high: 0, medium: 0, low: 0 };

      if (report.dependencies) {
        for (const dependency of report.dependencies) {
          if (dependency.vulnerabilities) {
            for (const vuln of dependency.vulnerabilities) {
              const vulnerability: Vulnerability = {
                id: vuln.name || vuln.cve || 'UNKNOWN',
                severity: this.mapOwaspSeverity(vuln.severity),
                title: vuln.description || vuln.name || 'Unknown vulnerability',
                description: vuln.description || 'No description available',
                component: dependency.fileName,
                references: vuln.references?.map((ref: any) => ref.url).filter(Boolean) || []
              };

              vulnerabilities.push(vulnerability);
              summary.total++;
              
              switch (vulnerability.severity) {
                case 'CRITICAL':
                case 'HIGH':
                  summary.high++;
                  break;
                case 'MEDIUM':
                  summary.medium++;
                  break;
                case 'LOW':
                  summary.low++;
                  break;
              }
            }
          }
        }
      }

      const scanDuration = Date.now() - startTime;
      const passed = summary.high === 0; // Only pass if no high/critical vulnerabilities

      return {
        scanner: 'OWASP Dependency Check',
        timestamp: new Date().toISOString(),
        passed,
        vulnerabilities,
        summary,
        scanDuration
      };

    } catch (error) {
      console.error('OWASP Dependency Check failed:', error);
      
      return {
        scanner: 'OWASP Dependency Check',
        timestamp: new Date().toISOString(),
        passed: false,
        vulnerabilities: [{
          id: 'SCAN_FAILED',
          severity: 'HIGH',
          title: 'Security scan failed',
          description: `OWASP Dependency Check scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        summary: { total: 1, high: 1, medium: 0, low: 0 },
        scanDuration: Date.now() - startTime
      };
    }
  }

  /**
   * Run Trivy container scan
   */
  async runTrivyContainerScan(imageName?: string): Promise<SecurityScanResult> {
    const startTime = Date.now();
    const outputFile = path.join(this.outputDir, 'trivy-report.json');

    try {
      await this.ensureOutputDir();

      // Default to scanning Dockerfile if no image specified
      const target = imageName || path.join(this.projectPath, 'Dockerfile');
      const command = imageName 
        ? `trivy image --format json --output "${outputFile}" "${imageName}"`
        : `trivy fs --format json --output "${outputFile}" "${this.projectPath}"`;

      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectPath,
        timeout: 300000, // 5 minutes timeout
      });

      // Parse results
      const reportContent = await fs.readFile(outputFile, 'utf-8');
      const report = JSON.parse(reportContent);

      const vulnerabilities: Vulnerability[] = [];
      let summary = { total: 0, high: 0, medium: 0, low: 0 };

      if (report.Results) {
        for (const result of report.Results) {
          if (result.Vulnerabilities) {
            for (const vuln of result.Vulnerabilities) {
              const vulnerability: Vulnerability = {
                id: vuln.VulnerabilityID,
                severity: this.mapTrivySeverity(vuln.Severity),
                title: vuln.Title || vuln.VulnerabilityID,
                description: vuln.Description || 'No description available',
                component: vuln.PkgName,
                version: vuln.InstalledVersion,
                fixedVersion: vuln.FixedVersion,
                references: vuln.References || []
              };

              vulnerabilities.push(vulnerability);
              summary.total++;
              
              switch (vulnerability.severity) {
                case 'CRITICAL':
                case 'HIGH':
                  summary.high++;
                  break;
                case 'MEDIUM':
                  summary.medium++;
                  break;
                case 'LOW':
                  summary.low++;
                  break;
              }
            }
          }
        }
      }

      const scanDuration = Date.now() - startTime;
      const passed = summary.high === 0; // Only pass if no high/critical vulnerabilities

      return {
        scanner: 'Trivy',
        timestamp: new Date().toISOString(),
        passed,
        vulnerabilities,
        summary,
        scanDuration
      };

    } catch (error) {
      console.error('Trivy scan failed:', error);
      
      return {
        scanner: 'Trivy',
        timestamp: new Date().toISOString(),
        passed: false,
        vulnerabilities: [{
          id: 'SCAN_FAILED',
          severity: 'HIGH',
          title: 'Container security scan failed',
          description: `Trivy scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        summary: { total: 1, high: 1, medium: 0, low: 0 },
        scanDuration: Date.now() - startTime
      };
    }
  }

  /**
   * Run ESLint security scan
   */
  async runESLintSecurityScan(): Promise<SecurityScanResult> {
    const startTime = Date.now();

    try {
      const command = `npx eslint --config .eslintrc.security.js --format json "**/*.{ts,tsx,js,jsx}" --ext .ts,.tsx,.js,.jsx`;
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectPath,
        timeout: 120000, // 2 minutes timeout
      });

      const results = JSON.parse(stdout);
      const vulnerabilities: Vulnerability[] = [];
      let summary = { total: 0, high: 0, medium: 0, low: 0 };

      for (const file of results) {
        for (const message of file.messages) {
          if (message.ruleId?.includes('security/')) {
            const severity = message.severity === 2 ? 'HIGH' : 'MEDIUM';
            
            const vulnerability: Vulnerability = {
              id: message.ruleId,
              severity: severity as 'HIGH' | 'MEDIUM',
              title: message.message,
              description: `${message.message} at ${file.filePath}:${message.line}:${message.column}`,
              component: file.filePath
            };

            vulnerabilities.push(vulnerability);
            summary.total++;
            
            if (severity === 'HIGH') {
              summary.high++;
            } else {
              summary.medium++;
            }
          }
        }
      }

      const scanDuration = Date.now() - startTime;
      const passed = summary.high === 0; // Only pass if no high severity issues

      return {
        scanner: 'ESLint Security',
        timestamp: new Date().toISOString(),
        passed,
        vulnerabilities,
        summary,
        scanDuration
      };

    } catch (error) {
      const stderr = error instanceof Error && 'stderr' in error ? (error as any).stderr : '';
      
      // ESLint returns exit code 1 when there are lint errors, but stdout still contains JSON
      if (error instanceof Error && 'stdout' in error && (error as any).stdout) {
        try {
          const results = JSON.parse((error as any).stdout);
          const vulnerabilities: Vulnerability[] = [];
          let summary = { total: 0, high: 0, medium: 0, low: 0 };

          for (const file of results) {
            for (const message of file.messages) {
              if (message.ruleId?.includes('security/')) {
                const severity = message.severity === 2 ? 'HIGH' : 'MEDIUM';
                
                const vulnerability: Vulnerability = {
                  id: message.ruleId,
                  severity: severity as 'HIGH' | 'MEDIUM',
                  title: message.message,
                  description: `${message.message} at ${file.filePath}:${message.line}:${message.column}`,
                  component: file.filePath
                };

                vulnerabilities.push(vulnerability);
                summary.total++;
                
                if (severity === 'HIGH') {
                  summary.high++;
                } else {
                  summary.medium++;
                }
              }
            }
          }

          const scanDuration = Date.now() - startTime;
          const passed = summary.high === 0;

          return {
            scanner: 'ESLint Security',
            timestamp: new Date().toISOString(),
            passed,
            vulnerabilities,
            summary,
            scanDuration
          };
        } catch (parseError) {
          // Fall through to error case
        }
      }

      console.error('ESLint security scan failed:', error);
      
      return {
        scanner: 'ESLint Security',
        timestamp: new Date().toISOString(),
        passed: false,
        vulnerabilities: [{
          id: 'SCAN_FAILED',
          severity: 'HIGH',
          title: 'ESLint security scan failed',
          description: `ESLint security scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        summary: { total: 1, high: 1, medium: 0, low: 0 },
        scanDuration: Date.now() - startTime
      };
    }
  }

  /**
   * Run comprehensive security scan
   */
  async runComprehensiveScan(containerImage?: string): Promise<SecurityScanResult[]> {
    console.log('Starting comprehensive security scan...');

    const [owaspResult, trivyResult, eslintResult] = await Promise.all([
      this.runOwaspDependencyCheck(),
      this.runTrivyContainerScan(containerImage),
      this.runESLintSecurityScan()
    ]);

    return [owaspResult, trivyResult, eslintResult];
  }

  private mapOwaspSeverity(severity: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    const upper = severity?.toUpperCase();
    switch (upper) {
      case 'CRITICAL':
        return 'CRITICAL';
      case 'HIGH':
        return 'HIGH';
      case 'MEDIUM':
        return 'MEDIUM';
      case 'LOW':
        return 'LOW';
      default:
        return 'MEDIUM';
    }
  }

  private mapTrivySeverity(severity: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    const upper = severity?.toUpperCase();
    switch (upper) {
      case 'CRITICAL':
        return 'CRITICAL';
      case 'HIGH':
        return 'HIGH';
      case 'MEDIUM':
        return 'MEDIUM';
      case 'LOW':
        return 'LOW';
      default:
        return 'MEDIUM';
    }
  }
}
