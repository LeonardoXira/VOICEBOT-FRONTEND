import { instance } from '../networking/axios'

interface ExtraInfoInterface {
  campo1: string;
  campo2: string;
  campo3: string;
  campo4: string;
  campo5: string;
  campo6: string;
  campo7: string;
  campo8: string;
  campo9: string;
  campo10: string;
}

class VoicebotService {
  async initNewCall(callId: string, phoneNumber: string, campaign: string, extraInfo: ExtraInfoInterface) {
    const response = await instance.post('/newCall', {
      callId,
      phoneNumber,
      campaign,
      extraInfo
    })

    return response.data
  }

  async continueCall(callId: string, phoneNumber: string, campaign: string, audioBase64: string) {
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