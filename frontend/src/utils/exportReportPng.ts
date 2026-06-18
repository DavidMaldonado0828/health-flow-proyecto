import html2canvas from 'html2canvas'

export function formatReportPngFilename(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `reporte-health-flow-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}.png`
}

export async function exportElementToPng(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    height: element.scrollHeight,
    width: element.scrollWidth,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: -window.scrollY,
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('No se pudo generar el archivo PNG'))
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
      resolve()
    }, 'image/png')
  })
}
