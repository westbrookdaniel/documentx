const app = document.querySelector<HTMLDivElement>('#app')!
import { VERSION } from 'vvanilla'

app.innerHTML = `
  <h1>Hello Version ${VERSION}</h1>
`
