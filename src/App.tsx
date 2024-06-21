import { useEffect, useRef, useState } from 'react'
import { convertBlobToBase64, formatTime } from './utils/helpers'
import { SendIcon } from './lib/icons/SendIcon'
import { voicebotService } from './services/voicebot.service'
import { ChatIcon } from './lib/icons/ChatIcon'

interface AudioClipInterface {
  id: number;
  url: string;
  blob: Blob;
}

export const App = () => {
  // Datos para iniciar la conversacion
  const [campaign, setCampaign] = useState('');
  const [phone, setPhone] = useState('');
  const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(false)

  const [isRecording, setIsRecording] = useState(false);
  // Audios
  const [audioClips, setAudioClips] = useState<AudioClipInterface[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);

  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const nextId = useRef(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (!isRecording && recordingTime !== 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatPhoneNumber = (value: string) => {
    // Eliminar todos los caracteres que no son dígitos
    const phoneNumberDigits = value.replace(/\D/g, '');
    let formattedNumber = '';

    // Agregar el primer bloque de 3 dígitos
    if (phoneNumberDigits.length > 0) {
        formattedNumber += phoneNumberDigits.substring(0, 3);
    }
    if (phoneNumberDigits.length >= 4) {
        formattedNumber += '-';
    }

    // Agregar el segundo bloque de 3 dígitos
    if (phoneNumberDigits.length > 3) {
        formattedNumber += phoneNumberDigits.substring(3, 6);
    }
    if (phoneNumberDigits.length >= 7) {
        formattedNumber += '-';
    }

    // Agregar el bloque final de 4 dígitos
    if (phoneNumberDigits.length > 6) {
        formattedNumber += phoneNumberDigits.substring(6, 10);
    }

    if (phoneNumberDigits.length < 10) {
      setIsValidPhoneNumber(false)
    } else {
      setIsValidPhoneNumber(true)
    }

    return formattedNumber;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhone(formattedNumber);
  };


  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const newClip: AudioClipInterface = {
        id: nextId.current++,
        url: audioUrl,
        blob: audioBlob,
      };
      setAudioClips((prevClips) => [...prevClips, newClip]);
      audioChunksRef.current = [];
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendAudio = async (clip: AudioClipInterface) => {
    const audioBase64 = await convertBlobToBase64(clip.blob);
    const response = voicebotService.continueCall(audioBase64);
    // const responseBase64 = await sendAudioToBackend(audioBase64);
    // const responseBlob = await convertBase64ToBlob(responseBase64, 'audio/wav');
    // const audioUrl = URL.createObjectURL(responseBlob);
    window.alert('Audio enviado y procesado correctamente.');
  };

  const handleDeleteAudio = (id: number) => {
    setAudioClips((prevClips) => prevClips.filter((clip) => clip.id !== id));
  };
    
  return (
      <div className='container mx-auto p-4'>
        <h1 className='text-3xl font-bold mb-6'>Charla con el Voicebot</h1>
        <section className="bg-white shadow-md rounded-lg p-6 mb-5">
          <div className="mb-4">
            <label htmlFor="campaigns" className="block mb-2 text-sm font-medium text-gray-900">Campaña</label>
              <select 
                id="campaigns" 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                onChange={(e) => setCampaign(e.target.value)}>
                <option selected disabled>Selecciona una campaña</option>
                <option value="Penta Liverpool Welcome Voicebot">Penta Liverpool Welcome Voicebot</option>
              </select>
              <p>{campaign} seleccionado</p>
            {/* <input 
              type="text" 
              id="campaign" 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              onChange={(e) => setCampaign(e.target.value)}
            /> */}
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">Número de Teléfono</label>
            <input 
              type="text" 
              id="phone" 
              name="phone"
              value={phone}
              onChange={handleChange}
              maxLength={12}
              pattern="\d{3}-\d{3}-\d{4}" 
              title="Debe tener el formato 123-456-7890"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className='text-center'>
            <button
              disabled={!campaign || !isValidPhoneNumber}
              className='px-4 py-2 rounded-lg text-white font-semibold bg-blue-500 hover:bg-blue-700 flex gap-3 items-center disabled:opacity-50 disabled:cursor-not-allowed transition duration-300'
              onClick={() => console.log('Click')}>
              Iniciar Conversación
              <ChatIcon className='fill-white' height='20' width='20' />
            </button>
          </div>
        </section>
        
        <section className='bg-white shadow-md rounded-lg p-6'>
          <div className='text-center'>
            <h1 className='text-2xl font-semibold mb-4'>Charla con el Voicebot</h1>
            <div className='mb-4'>
              {isRecording && <div className='text-xl'>{formatTime(recordingTime)}</div>}
            </div>
            <button 
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                isRecording ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'
              } transition duration-300`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <div className='mt-4'>
              {audioClips.map((clip) => (
                <div key={clip.id} className='bg-gray-100 p-4 rounded-lg mb-4 flex items-center justify-between'>
                  <audio className='mr-4' controls src={clip.url} />
                  <div className='flex'>
                    <button onClick={() => handleSendAudio(clip)}className='px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg mr-2 flex items-center gap-2'
                    >
                      Enviar
                      <SendIcon width='15' height='15' className='fill-white'/>
                    </button>
                    <button 
                      onClick={() => handleDeleteAudio(clip.id)}
                      className='px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
  )
}
