import {v2 as cloudinaryInstance} from 'cloudinary'
import {Configuration, OpenAIApi} from 'openai'

cloudinaryInstance.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

type Cloudinary = typeof cloudinaryInstance

const openaiInstance = new OpenAIApi(
  new Configuration({
    organization: process.env.OPENAPI_ORG,
    apiKey: process.env.OPENAPI_API_KEY,
  }),
)

export function imageFactory(cloudinary: Cloudinary, openai: OpenAIApi) {
  async function upload(id: string, url: string) {
    return cloudinary.uploader.upload(url, {
      public_id: id,
      overwrite: true,
    })
  }

  function toUrl(id: string) {
    return cloudinary.url(id)
  }

  async function exists(id: string) {
    try {
      await cloudinary.api.resource(id)
      return true
    } catch {
      return false
    }
  }

  async function generate(id: string, description: string) {
    const response = await openai.createImage({
      prompt: description,
    })

    const url = response.data.data[0].url

    if (url) {
      await upload(id, url)
    }

    return url
  }

  return {
    generate,
    toUrl,
    exists,
  }
}

export const image = imageFactory(cloudinaryInstance, openaiInstance)
