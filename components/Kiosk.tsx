
import React, { useState, useEffect, useRef } from 'react';
import { TriageLevel, Patient } from '../types';
import BodyMap from './BodyMap';
import { analyzeSymptoms } from '../services/gemini';

interface KioskProps {
  onCheckIn: (data: Partial<Patient>) => void;
  onEmergency: () => void;
  activeQueueLength: number;
}

type Language = 'English' | 'Français' | '中文' | 'ਪੰਜਾਬੀ' | 'العربية';
type KioskStep = 'WELCOME' | 'ID' | 'INPUT_CHOICE' | 'TEXT_INPUT' | 'VOICE_INPUT' | 'BODY_MAP' | 'PHOTO_UPLOAD' | 'ANALYZING' | 'SUMMARY' | 'EMERGENCY_CONFIRMED';

const translations = {
  English: {
    hello: "Hello.",
    touch: "Touch the screen to start.",
    checkIn: "Check-in Now",
    helpNow: "Help Now",
    back: "Go Back",
    identify: "Identify yourself",
    scanQR: "Scan QR Code",
    scanHealth: "Scan Health Card",
    anonymous: "Continue anonymously",
    howDescribe: "How would you like to describe your issue?",
    chooseOptions: "Choose options to help our staff.",
    typeIt: "Keyboard",
    speakIt: "Microphone",
    showWhere: "Body Map",
    addPhoto: "Camera",
    almostDone: "Almost done?",
    submit: "Review & Submit",
    symptomsQ: "What symptoms are you feeling?",
    done: "Continue",
    record: "Record your message",
    speakClearly: "Speak clearly into the microphone.",
    pointWhere: "Point to where it hurts",
    takePhoto: "Take a photo",
    analyzing: "Analyzing Symptoms...",
    complete: "Check-in Complete",
    wait: "Estimated Wait",
    queue: "Queue Position",
    startNew: "Close and Start New",
    clear: "Clear All",
    emergencySent: "Help request sent.",
    nurseNotified: "A nurse has been notified.",
    stayPut: "Please stay where you are. Help is on the way.",
    calmMessage: "We are coming to assist you right now."
  },
  Français: {
    hello: "Bonjour.",
    touch: "Touchez l'écran pour commencer.",
    checkIn: "S'enregistrer maintenant",
    helpNow: "Aide immédiate",
    back: "Retour",
    identify: "Identifiez-vous",
    scanQR: "Scanner le code QR",
    scanHealth: "Scanner la carte santé",
    anonymous: "Continuer anonymement",
    howDescribe: "Comment souhaitez-vous décrire votre problème ?",
    chooseOptions: "Choisissez des options pour aider notre personnel.",
    typeIt: "Clavier",
    speakIt: "Microphone",
    showWhere: "Carte du corps",
    addPhoto: "Appareil photo",
    almostDone: "Presque fini ?",
    submit: "Réviser et Envoyer",
    symptomsQ: "Quels sont vos symptômes ?",
    done: "Continuer",
    record: "Enregistrez votre message",
    speakClearly: "Parlez clairement dans le microphone.",
    pointWhere: "Montrez où ça fait mal",
    takePhoto: "Prendre une photo",
    analyzing: "Analyse des symptômes...",
    complete: "Enregistrement terminé",
    wait: "Attente estimée",
    queue: "Position dans la file",
    startNew: "Fermer et recommencer",
    clear: "Effacer",
    emergencySent: "Demande d'aide envoyée.",
    nurseNotified: "Une infirmière a été prévenue.",
    stayPut: "Veuillez rester où vous êtes. L'aide arrive.",
    calmMessage: "Nous venons vous aider immédiatement."
  },
  中文: {
    hello: "您好。",
    touch: "触摸屏幕开始。",
    checkIn: "立即登记",
    helpNow: "立即寻求帮助",
    back: "返回",
    identify: "身份验证",
    scanQR: "扫描二维码",
    scanHealth: "扫描健康卡",
    anonymous: "匿名继续",
    howDescribe: "您想如何描述您的情况？",
    chooseOptions: "选择选项以帮助我们的工作人员。",
    typeIt: "键盘",
    speakIt: "麦克风",
    showWhere: "身体图",
    addPhoto: "相机",
    almostDone: "快完成了？",
    submit: "检查并提交",
    symptomsQ: "你感觉有什么症状？",
    done: "继续",
    record: "录制您的信息",
    speakClearly: "请对着麦克风清晰说话。",
    pointWhere: "指出疼痛部位",
    takePhoto: "拍照",
    analyzing: "正在分析症状...",
    complete: "登记完成",
    wait: "预计等待时间",
    queue: "排队位置",
    startNew: "关闭并重新开始",
    clear: "清除",
    emergencySent: "求助请求已发送。",
    nurseNotified: "护士已收到通知。",
    stayPut: "请留在原地。救援即刻就到。",
    calmMessage: "我们马上就来协助您。"
  },
  ਪੰਜਾਬੀ: {
    hello: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ।",
    touch: "ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਸਕ੍ਰੀਨ ਨੂੰ ਛੋਹਵੋ।",
    checkIn: "ਹੁਣੇ ਚੈੱਕ-ਇਨ ਕਰੋ",
    helpNow: "ਹੁਣੇ ਮਦਦ",
    back: "ਪਿੱਛੇ ਜਾਓ",
    identify: "ਆਪਣੀ ਪਛਾਣ ਕਰੋ",
    scanQR: "QR ਕੋਡ ਸਕੈਨ ਕਰੋ",
    scanHealth: "ਹੈਲਥ ਕਾਰਡ ਸਕੈਨ ਕਰੋ",
    anonymous: "ਗੁਮਨਾਮ ਤੌਰ 'ਤੇ ਜਾਰੀ ਰੱਖੋ",
    howDescribe: "ਤੁਸੀਂ ਆਪਣੀ ਸਮੱਸਿਆ ਦਾ ਵਰਣਨ ਕਿਵੇਂ ਕਰਨਾ ਚਾਹੋਗੇ?",
    chooseOptions: "ਸਟਾਫ ਦੀ ਮਦਦ ਲਈ ਵਿਕਲਪ ਚੁਣੋ।",
    typeIt: "ਕੀਬੋਰਡ",
    speakIt: "ਮਾਈਕ੍ਰੋਫੋਨ",
    showWhere: "ਸਰੀਰ ਦਾ ਨਕਸ਼ਾ",
    addPhoto: "ਕੈਮਰਾ",
    almostDone: "ਲਗਭਗ ਹੋ ਗਿਆ?",
    submit: "ਸਮੀਖਿਆ ਅਤੇ ਜਮ੍ਹਾਂ ਕਰੋ",
    symptomsQ: "ਤੁਸੀਂ ਕਿਹੜੇ ਲੱਛਣ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?",
    done: "ਜਾਰੀ ਰੱਖੋ",
    record: "ਆਪਣਾ ਸੁਨੇਹਾ ਰਿਕਾਰਡ ਕਰੋ",
    speakClearly: "ਮਾਈਕ੍ਰੋਫੋਨ ਵਿੱਚ ਸਾਫ਼ ਬੋਲੋ।",
    pointWhere: "ਦੱਸੋ ਕਿ ਕਿੱਥੇ ਦਰਦ ਹੈ",
    takePhoto: "ਫੋਟੋ ਖਿੱਚੋ",
    analyzing: "ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...",
    complete: "ਚੈੱਕ-ਇਨ ਪੂਰਾ ਹੋਇਆ",
    wait: "ਅਨੁਮਾਨਿਤ ਉਡੀਕ",
    queue: "ਕਤਾਰ ਦੀ ਸਥਿਤੀ",
    startNew: "ਬੰਦ ਕਰੋ ਅਤੇ ਨਵਾਂ ਸ਼ੁਰੂ ਕਰੋ",
    clear: "ਸਾਫ਼ ਕਰੋ",
    emergencySent: "ਮਦਦ ਦੀ ਬੇਨਤੀ ਭੇਜੀ ਗਈ।",
    nurseNotified: "ਇੱਕ ਨਰਸ ਨੂੰ ਸੂਚਿਤ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ।",
    stayPut: "ਕਿਰਪਾ ਕਰਕੇ ਜਿੱਥੇ ਹੋ ਉੱਥੇ ਹੀ ਰਹੋ। ਮਦਦ ਆ ਰਹੀ ਹੈ।",
    calmMessage: "ਅਸੀਂ ਹੁਣੇ ਤੁਹਾਡੀ ਸਹਾਇਤਾ ਲਈ ਆ ਰਹੇ ਹਾਂ।"
  },
  العربية: {
    hello: "مرحباً.",
    touch: "المس الشاشة للبدء.",
    checkIn: "سجل دخولك الآن",
    helpNow: "طلب مساعدة فورية",
    back: "العودة",
    identify: "حدد هويتك",
    scanQR: "مسح رمز الاستجابة السريعة",
    scanHealth: "مسح البطاقة الصحية",
    anonymous: "الاستمرار كمجهول",
    howDescribe: "كيف تود وصف مشكلتك؟",
    chooseOptions: "اختر خيارات لمساعدة طاقمنا.",
    typeIt: "لوحة المفاتيح",
    speakIt: "ميكروفون",
    showWhere: "خريطة الجسم",
    addPhoto: "كاميرا",
    almostDone: "هل انتهيت تقريباً؟",
    submit: "مراجعة وإرسال",
    symptomsQ: "ما هي الأعراض التي تشعر بها؟",
    done: "متابعة",
    record: "سجل رسالتك",
    speakClearly: "تحدث بوضوح في الميكروفون.",
    pointWhere: "حدد مكان الألم",
    takePhoto: "التقط صورة",
    analyzing: "تحليل الأعراض...",
    complete: "اكتمل تسجيل الدخول",
    wait: "الانتظار المتوقع",
    queue: "موقعك في الطابور",
    startNew: "إغلاق والبدء من جديد",
    clear: "مسح",
    emergencySent: "تم إرسال طلب المساعدة.",
    nurseNotified: "تم إخطار الممرضة.",
    stayPut: "يرجى البقاء في مكانك. المساعدة في الطريق.",
    calmMessage: "نحن قادمون لمساعدتك الآن."
  }
};

const Kiosk: React.FC<KioskProps> = ({ onCheckIn, onEmergency, activeQueueLength }) => {
  const [lang, setLang] = useState<Language>('English');
  const [step, setStep] = useState<KioskStep>('WELCOME');
  const [symptoms, setSymptoms] = useState('');
  const [transcript, setTranscript] = useState('');
  const [drawing, setDrawing] = useState('');
  const [photo, setPhoto] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<Partial<Patient> | null>(null);

  const t = translations[lang];

  // Speech Recognition Setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      const langCodes: Record<Language, string> = {
        'English': 'en-US',
        'Français': 'fr-FR',
        '中文': 'zh-CN',
        'ਪੰਜਾਬੀ': 'pa-IN',
        'العربية': 'ar-SA'
      };
      recognitionRef.current.lang = langCodes[lang];

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i][0].confidence > 0.1) {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsRecording(false);
      };
    }
  }, [lang]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleEmergencyClick = () => {
    onEmergency();
    setStep('EMERGENCY_CONFIRMED');
    // Long timeout for emergency so staff can find them
    setTimeout(resetKiosk, 60000);
  };

  const resetKiosk = () => {
    setStep('WELCOME');
    setSymptoms('');
    setTranscript('');
    setDrawing('');
    setPhoto('');
    setIsRecording(false);
    setIsAnonymous(false);
    setLastCheckIn(null);
  };

  const handleFinish = async () => {
    setStep('ANALYZING');
    const result = await analyzeSymptoms(symptoms, transcript, drawing ? "Marked pain on body map" : "", lang);
    const patientData = {
      name: isAnonymous ? "Anonymous Patient" : "Registered Patient",
      symptoms: symptoms,
      voiceTranscript: transcript,
      drawingData: drawing,
      photoData: photo,
      triageLevel: result.level,
      aiSummary: result.summary,
    };
    setLastCheckIn(patientData);
    onCheckIn(patientData);
    setStep('SUMMARY');
    setTimeout(resetKiosk, 30000);
  };

  const renderStep = () => {
    const isRtl = lang === 'العربية';

    switch (step) {
      case 'WELCOME':
        return (
          <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 animate-fadeIn">
            <div className="flex gap-4 mb-12 flex-wrap justify-center">
              {(Object.keys(translations) as Language[]).map((l) => (
                <button 
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-6 py-3 rounded-full font-bold transition-all border-2 ${lang === l ? 'bg-blue-600 text-white border-blue-600 scale-105' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {l}
                </button>
              ))}
            </div>

            <h1 className="text-6xl font-extrabold text-slate-900 mb-4 text-center">{t.hello}</h1>
            <p className="text-2xl text-slate-500 mb-12 text-center">{t.touch}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <button onClick={() => setStep('ID')} className="kiosk-button bg-blue-600 hover:bg-blue-700 text-white p-10 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-xl shadow-blue-200">
                <i className="fa-solid fa-id-card text-7xl"></i>
                <span className="text-3xl font-bold">{t.checkIn}</span>
              </button>
              <button onClick={handleEmergencyClick} className="kiosk-button bg-red-600 hover:bg-red-700 text-white p-10 rounded-[2.5rem] flex flex-col items-center gap-6 shadow-xl shadow-red-200">
                <i className="fa-solid fa-triangle-exclamation text-7xl"></i>
                <span className="text-3xl font-bold uppercase">{t.helpNow}</span>
              </button>
            </div>
          </div>
        );

      case 'EMERGENCY_CONFIRMED':
        return (
          <div className={`flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 animate-fadeIn ${isRtl ? 'rtl' : ''}`}>
            <div className="bg-white border-4 border-red-500 rounded-[3rem] p-16 w-full shadow-2xl flex flex-col items-center text-center">
              <div className="bg-red-500 text-white w-32 h-32 rounded-full flex items-center justify-center mb-10 shadow-lg animate-bounce">
                <i className="fa-solid fa-check text-7xl"></i>
              </div>
              <h2 className="text-5xl font-black text-slate-900 mb-6">{t.emergencySent}</h2>
              <div className="space-y-4 max-w-2xl">
                <p className="text-3xl font-bold text-red-600">{t.nurseNotified}</p>
                <p className="text-2xl text-slate-600 font-medium">{t.stayPut}</p>
                <p className="text-xl text-slate-400 italic">{t.calmMessage}</p>
              </div>
            </div>
            <button 
              onClick={resetKiosk}
              className="mt-12 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-xl flex items-center gap-3"
            >
              <i className="fa-solid fa-xmark"></i> {t.startNew}
            </button>
          </div>
        );

      case 'ID':
        return (
          <div className={`flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 animate-slideIn ${isRtl ? 'rtl' : ''}`}>
            <button onClick={() => setStep('WELCOME')} className="self-start mb-8 text-slate-400 text-xl font-bold flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-slate-200 hover:bg-slate-50 shadow-sm">
              <i className={`fa-solid ${isRtl ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i> {t.back}
            </button>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-12">{t.identify}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
              <div className="border-4 border-dashed border-slate-300 rounded-[2rem] p-8 flex flex-col items-center justify-center text-slate-400 bg-white">
                <i className="fa-solid fa-qrcode text-6xl mb-4"></i>
                <p className="text-xl font-bold">{t.scanQR}</p>
              </div>
              <div className="border-4 border-dashed border-slate-300 rounded-[2rem] p-8 flex flex-col items-center justify-center text-slate-400 bg-white">
                <i className="fa-solid fa-credit-card text-6xl mb-4"></i>
                <p className="text-xl font-bold">{t.scanHealth}</p>
              </div>
            </div>
            <button onClick={() => { setIsAnonymous(true); setStep('INPUT_CHOICE'); }} className="text-blue-600 font-bold text-2xl underline decoration-2 underline-offset-8">
              {t.anonymous}
            </button>
          </div>
        );

      case 'INPUT_CHOICE':
        return (
          <div className={`flex flex-col items-center justify-center h-full max-w-5xl mx-auto px-6 animate-slideIn ${isRtl ? 'rtl text-right' : ''}`}>
            <button onClick={() => setStep('ID')} className="self-start mb-8 text-slate-400 text-xl font-bold flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-slate-200 hover:bg-slate-50 shadow-sm">
              <i className={`fa-solid ${isRtl ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i> {t.back}
            </button>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 text-center">{t.howDescribe}</h2>
            <p className="text-xl text-slate-500 mb-12">{t.chooseOptions}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
              <button onClick={() => setStep('TEXT_INPUT')} className={`kiosk-button bg-white border-2 p-8 rounded-3xl flex flex-col items-center gap-4 shadow-sm group ${symptoms ? 'border-blue-400 ring-2 ring-blue-50' : 'border-slate-200'}`}>
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-2">
                  <i className="fa-solid fa-keyboard text-4xl text-blue-600"></i>
                </div>
                <span className="text-lg font-bold">{t.typeIt}</span>
                <span className="text-xs text-slate-400 font-bold tracking-tight">Keyboard Icon ⌨️</span>
              </button>
              <button onClick={() => setStep('VOICE_INPUT')} className={`kiosk-button bg-white border-2 p-8 rounded-3xl flex flex-col items-center gap-4 shadow-sm group ${transcript ? 'border-red-400 ring-2 ring-red-50' : 'border-slate-200'}`}>
                <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mb-2">
                  <i className="fa-solid fa-microphone text-4xl text-red-600"></i>
                </div>
                <span className="text-lg font-bold">{t.speakIt}</span>
                <span className="text-xs text-slate-400 font-bold tracking-tight">Microphone Icon 🎤</span>
              </button>
              <button onClick={() => setStep('BODY_MAP')} className={`kiosk-button bg-white border-2 p-8 rounded-3xl flex flex-col items-center gap-4 shadow-sm group ${drawing ? 'border-green-400 ring-2 ring-green-50' : 'border-slate-200'}`}>
                <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mb-2">
                  <i className="fa-solid fa-hand-dots text-4xl text-green-600"></i>
                </div>
                <span className="text-lg font-bold">{t.showWhere}</span>
                <span className="text-xs text-slate-400 font-bold tracking-tight">Body Map Icon 🧍</span>
              </button>
              <button onClick={() => setStep('PHOTO_UPLOAD')} className={`kiosk-button bg-white border-2 p-8 rounded-3xl flex flex-col items-center gap-4 shadow-sm group ${photo ? 'border-purple-400 ring-2 ring-purple-50' : 'border-slate-200'}`}>
                <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mb-2">
                  <i className="fa-solid fa-camera text-4xl text-purple-600"></i>
                </div>
                <span className="text-lg font-bold">{t.addPhoto}</span>
                <span className="text-xs text-slate-400 font-bold tracking-tight">Camera Icon 📷</span>
              </button>
            </div>

            <div className="mt-16 w-full flex justify-between items-center bg-blue-50 p-8 rounded-3xl border border-blue-100">
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <p className="text-blue-900 font-bold text-2xl">{t.almostDone}</p>
                <p className="text-blue-700">{t.chooseOptions}</p>
              </div>
              <button 
                disabled={!symptoms && !transcript && !drawing && !photo}
                onClick={handleFinish}
                className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-bold text-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
              >
                {t.submit} <i className={`fa-solid ${isRtl ? 'fa-arrow-left' : 'fa-arrow-right'} ml-2`}></i>
              </button>
            </div>
          </div>
        );

      case 'TEXT_INPUT':
        return (
          <div className={`flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 animate-slideIn ${isRtl ? 'rtl' : ''}`}>
            <button onClick={() => setStep('INPUT_CHOICE')} className="self-start mb-8 text-slate-400 text-xl font-bold flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-slate-200 hover:bg-slate-50 shadow-sm">
              <i className={`fa-solid ${isRtl ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i> {t.back}
            </button>
            <h2 className="text-3xl font-bold mb-8">{t.symptomsQ}</h2>
            <textarea 
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="..."
              dir={isRtl ? 'rtl' : 'ltr'}
              className="w-full h-64 p-8 text-2xl border-4 border-slate-200 rounded-[2rem] focus:border-blue-500 outline-none transition-colors shadow-inner"
            />
            <div className="flex gap-4 w-full justify-center">
               <button onClick={() => setSymptoms('')} className="mt-8 bg-white border border-slate-200 text-slate-600 px-12 py-5 rounded-2xl font-bold text-2xl hover:bg-slate-50">
                {t.clear}
              </button>
              <button onClick={() => setStep('INPUT_CHOICE')} className="mt-8 bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold text-2xl">
                {t.done} <i className="fa-solid fa-check ml-2"></i>
              </button>
            </div>
          </div>
        );

      case 'VOICE_INPUT':
        return (
          <div className={`flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 animate-slideIn ${isRtl ? 'rtl' : ''}`}>
            <button onClick={() => setStep('INPUT_CHOICE')} className="self-start mb-8 text-slate-400 text-xl font-bold flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-slate-200 hover:bg-slate-50 shadow-sm">
              <i className={`fa-solid ${isRtl ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i> {t.back}
            </button>
            <h2 className="text-3xl font-bold mb-4">{t.record}</h2>
            <p className="text-slate-500 mb-12">{t.speakClearly}</p>
            <button 
              onClick={toggleRecording}
              className={`w-48 h-48 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isRecording ? 'bg-red-500 scale-110 animate-pulse' : 'bg-white border-8 border-slate-100'}`}
            >
              <i className={`fa-solid fa-microphone text-6xl ${isRecording ? 'text-white' : 'text-slate-300'}`}></i>
            </button>
            <div className="mt-12 w-full min-h-[150px] bg-white border-2 border-slate-100 rounded-3xl p-8 italic text-slate-700 flex items-center justify-center text-center text-2xl shadow-inner relative">
              {transcript || "..."}
              {transcript && !isRecording && (
                <button onClick={() => setTranscript('')} className="absolute top-2 right-2 text-xs text-red-400 uppercase font-bold p-2">
                  <i className="fa-solid fa-trash-can mr-1"></i> {t.clear}
                </button>
              )}
            </div>
            <div className="flex gap-4 w-full justify-center">
              <button onClick={() => setStep('INPUT_CHOICE')} className="mt-12 bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold text-2xl">
                {t.done} <i className="fa-solid fa-check ml-2"></i>
              </button>
            </div>
          </div>
        );

      case 'BODY_MAP':
        return (
          <div className={`flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 animate-slideIn ${isRtl ? 'rtl' : ''}`}>
            <button onClick={() => setStep('INPUT_CHOICE')} className="self-start mb-8 text-slate-400 text-xl font-bold flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-slate-200 hover:bg-slate-50 shadow-sm">
              <i className={`fa-solid ${isRtl ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i> {t.back}
            </button>
            <h2 className="text-3xl font-bold mb-4">{t.pointWhere}</h2>
            <BodyMap onSave={(data) => setDrawing(data)} onClear={() => setDrawing('')} />
            <button onClick={() => setStep('INPUT_CHOICE')} className="mt-8 bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold text-2xl">
              {t.done} <i className="fa-solid fa-check ml-2"></i>
            </button>
          </div>
        );

      case 'PHOTO_UPLOAD':
        return (
          <div className={`flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 animate-slideIn ${isRtl ? 'rtl' : ''}`}>
            <button onClick={() => setStep('INPUT_CHOICE')} className="self-start mb-8 text-slate-400 text-xl font-bold flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-slate-200 hover:bg-slate-50 shadow-sm">
              <i className={`fa-solid ${isRtl ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i> {t.back}
            </button>
            <h2 className="text-3xl font-bold mb-4">{t.takePhoto}</h2>
            <div className="w-full aspect-video bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center text-white relative overflow-hidden">
              {photo ? <img src={photo} alt="Injury" className="w-full h-full object-cover" /> : <i className="fa-solid fa-camera text-6xl mb-4 opacity-50"></i>}
              {photo && (
                <button onClick={() => setPhoto('')} className="absolute top-4 right-4 bg-red-600 text-white p-4 rounded-full shadow-lg">
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              )}
            </div>
            <div className="flex gap-6 mt-12">
              <button onClick={() => setPhoto('https://picsum.photos/seed/' + Math.random() + '/800/600')} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-xl">
                Capture
              </button>
              <button onClick={() => setStep('INPUT_CHOICE')} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-xl">
                {t.done} <i className="fa-solid fa-check ml-2"></i>
              </button>
            </div>
          </div>
        );

      case 'ANALYZING':
        return (
          <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 animate-pulse">
            <div className="w-32 h-32 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mb-12"></div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">{t.analyzing}</h2>
          </div>
        );

      case 'SUMMARY':
        return (
          <div className={`flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 animate-slideIn ${isRtl ? 'rtl' : ''}`}>
            <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mb-8">
              <i className="fa-solid fa-check text-5xl"></i>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2">{t.complete}</h2>
            <div className="bg-white border-2 border-slate-200 rounded-[3rem] p-12 w-full shadow-xl flex flex-col items-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-4 bg-blue-600"></div>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4">#{lastCheckIn?.queueNumber}</p>
               <h3 className="text-9xl font-black text-slate-900 mb-8">{lastCheckIn?.queueNumber}</h3>
               <div className="grid grid-cols-2 gap-12 w-full border-t border-slate-100 pt-10">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm font-bold uppercase mb-1">{t.wait}</p>
                    <p className="text-3xl font-extrabold text-blue-600">12 min</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm font-bold uppercase mb-1">{t.queue}</p>
                    <p className="text-3xl font-extrabold text-slate-900">#{activeQueueLength + 1}</p>
                  </div>
               </div>
            </div>
            <button onClick={resetKiosk} className="mt-12 text-slate-400 font-bold text-xl flex items-center gap-2 hover:text-slate-600">
              {t.startNew} <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-20"></div>
      {renderStep()}
    </div>
  );
};

export default Kiosk;
