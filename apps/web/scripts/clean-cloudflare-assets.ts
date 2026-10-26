import { existsSync, readdirSync, statSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

const maxBytes = 25 * 1024 * 1024 // 25 MiB Cloudflare Workers asset limit
const publicDir = new URL('../.output/public', import.meta.url).pathname

function cleanDir(dir: string) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      cleanDir(fullPath)
    } else if (stat.isFile()) {
      if (stat.size >= maxBytes || entry.includes('asyncify')) {
        console.log(
          `[cloudflare-clean] Removing asset: ${entry} (${(stat.size / 1024 / 1024).toFixed(2)} MiB)`,
        )
        unlinkSync(fullPath)
      }
    }
  }
}

cleanDir(publicDir)
