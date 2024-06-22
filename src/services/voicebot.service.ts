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

  async continueCall (callId: string, phoneNumber: string, campaign: string, audioBase64: string) {
    const response = await instance.post('/call', {
      callId,
      phoneNumber,
      campaign,
      audioBase64
    })

    return response.data
  }
}

export const voicebotService = new VoicebotService()
