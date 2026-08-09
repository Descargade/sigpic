import { useState, useRef } from 'react'
import { Download, Upload, AlertTriangle, CheckCircle, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { saveDatabase, exportBackup, importBackup } from '@/db'

export function SettingsPage() {
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    try {
      const base64 = exportBackup()
      const blob = new Blob([base64], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `2blea-backup-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setMessage({ type: 'success', text: 'Backup exportado correctamente' })
    } catch {
      setMessage({ type: 'error', text: 'Error al exportar el backup' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setMessage(null)

    try {
      const text = await file.text()
      const base64 = text.trim()
      await importBackup(base64)
      setMessage({ type: 'success', text: 'Backup importado correctamente. Recargando...' })
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      setMessage({ type: 'error', text: 'Error al importar. Archivo inválido o corrupto.' })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleSaveDb() {
    try {
      saveDatabase()
      setMessage({ type: 'success', text: 'Base de datos guardada manualmente' })
    } catch {
      setMessage({ type: 'error', text: 'Error al guardar' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="space-y-6" id="backup">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tus datos y preferencias</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-success/10 text-success'
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Base de Datos</CardTitle>
          <CardDescription>
            Tu información se guarda localmente en SQLite. Exportá un backup regularmente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar backup
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
              <Upload className="h-4 w-4" />
              {importing ? 'Importando...' : 'Importar backup'}
            </Button>
            <Button variant="secondary" onClick={handleSaveDb}>
              <Database className="h-4 w-4" />
              Guardar manualmente
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          <div className="rounded-lg border border-warning/50 bg-warning/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
              <div className="text-sm">
                <p className="font-medium text-warning">Importante sobre los backups</p>
                <ul className="mt-1 list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Exportá un backup antes de limpiar el navegador</li>
                  <li>Guardá el archivo en un lugar seguro</li>
                  <li>La importación reemplaza todos los datos actuales</li>
                  <li>Los datos se guardan automáticamente al hacer cambios</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencias de Búsqueda</CardTitle>
          <CardDescription>
            Configura las preferencias para filtrar oportunidades (Fase 3)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Las preferencias de búsqueda estarán disponibles en la Fase 3.
            Por ahora, podés agregar oportunidades manualmente desde la sección Oportunidades.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de IA</CardTitle>
          <CardDescription>
            Configura tu proveedor de inteligencia artificial (Fase 2)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            La configuración de IA estará disponible en la Fase 2.
            Podrás elegir entre OpenAI, Anthropic u Ollama.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
