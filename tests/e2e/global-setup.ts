import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// Adds the upcoming-match fixtures to the local database (the seed has no upcoming match on purpose).
export default function setup() {
  execFileSync('docker', ['exec', '-i', 'supabase_db_rall-venezia-fc', 'psql', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres'], {
    input: readFileSync(new URL('./fixtures.sql', import.meta.url)),
  })
}
