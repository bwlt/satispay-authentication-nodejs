export type Header = [string, string]

export interface HTTPRequest {
  body?: string
  method: string
  url: string
  headers: Header[]
}
