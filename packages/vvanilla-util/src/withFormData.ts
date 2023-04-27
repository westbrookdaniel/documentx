export const withFormData =
  <T>(cb: (data: T, target: HTMLFormElement) => void) =>
  (e: SubmitEvent) => {
    e.preventDefault()
    const el = e.target as HTMLFormElement
    const formData = new FormData(el)
    // @ts-ignore - Entries does exist?
    const data = Object.fromEntries(formData.entries()) as T
    cb(data, el)
  }
