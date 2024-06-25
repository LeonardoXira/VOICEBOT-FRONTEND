import { instance } from '../networking/axios'

interface NewCallResponseInterface {
  callId: string
  numDeriv: string
  phoneNumber: string
  estatus: number
  audio64: string
}

class VoicebotService {
  async initNewCall (callId: string, phoneNumber: string, campaign: string, extraInfo: { [key: number]: string }): Promise<NewCallResponseInterface> {
    const response = await instance.post('/newCall', {
      callId,
      phoneNumber,
      campaign,
      extraInfo
    })

    return response.data
  }

  async continueCall (callId: string, phoneNumber: string, campaign: string, audioBlob: Blob) {
    const formData = new FormData()
    const timestamp = new Date().getTime()

    formData.append('callId', callId)
    formData.append('phoneNumber', phoneNumber)
    formData.append('campaign', campaign)
    formData.append('audio', audioBlob, `${timestamp}`)

    console.log('Enviando Audio...', audioBlob)
    const response = await instance.post('/call', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    console.log('Audio Enviado')

    return response.data
  }
}

export const voicebotService = new VoicebotService()
