/**
 * Samadhan Setu — Voice Feedback Service
 * Centralized audio engine for non-literate tribal accessibility:
 * - Programmatic speech playback (Bhashini TTS + Device Speech fallback)
 * - Digit-by-digit spoken confirmations for numeric PIN keypad
 * - Dynamic alerts (errors, successes) spoken aloud automatically
 * - Audio-first language selection prompts in all 12 native Jharkhand languages
 * - Pre-permission audio explanations before OS-level dialogs
 */
import { resolveVoiceLanguage, synthesizeSpeech } from './voice.service';

// Dynamic module loaders for compatibility across native runtimes
let ExpoAudioModule: any = null;
try {
  ExpoAudioModule = require('expo-audio');
} catch {
  ExpoAudioModule = null;
}

let ExpoAvModule: any = null;
try {
  ExpoAvModule = require('expo-av').Audio;
} catch {
  ExpoAvModule = null;
}

let SpeechModule: any = null;
try {
  SpeechModule = require('expo-speech');
} catch {
  SpeechModule = null;
}

let FileSystemModule: any = null;
try {
  FileSystemModule = require('expo-file-system');
} catch {
  FileSystemModule = null;
}

let activeSound: any = null;

// Spoken numbers dictionary (0-9) across all 12 languages
export const SPOKEN_DIGITS: Record<string, Record<string, string>> = {
  hi: { '0': 'शून्य', '1': 'एक', '2': 'दो', '3': 'तीन', '4': 'चार', '5': 'पांच', '6': 'छह', '7': 'सात', '8': 'आठ', '9': 'नौ' },
  en: { '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine' },
  sat: { '0': 'शून्य', '1': 'মিৎ', '2': 'বার', '3': 'পে', '4': 'पोन', '5': 'मोड़े', '6': 'तुरुय', '7': 'एयाय', '8': 'इरल', '9': 'आरे' },
  kht: { '0': 'शून्य', '1': 'एक', '2': 'दू', '3': 'तीन', '4': 'चार', '5': 'पाँच', '6': 'छौ', '7': 'सात', '8': 'आठ', '9': 'नौ' },
  nag: { '0': 'शून्य', '1': 'एक', '2': 'दुई', '3': 'तीन', '4': 'चार', '5': 'पाँच', '6': 'छ', '7': 'सात', '8': 'आठ', '9': 'नौ' },
  bho: { '0': 'शून्य', '1': 'एक', '2': 'दू', '3': 'तीन', '4': 'चार', '5': 'पाँच', '6': 'छव', '7': 'सात', '8': 'आठ', '9': 'नौ' },
  anp: { '0': 'शून्य', '1': 'एक', '2': 'दू', '3': 'तीन', '4': 'चार', '5': 'पाँच', '6': 'छ', '7': 'सात', '8': 'आठ', '9': 'नौ' },
  mag: { '0': 'शून्य', '1': 'एक', '2': 'दू', '3': 'तीन', '4': 'चार', '5': 'पाँच', '6': 'छ', '7': 'सात', '8': 'आठ', '9': 'नौ' },
  mai: { '0': 'शून्य', '1': 'एक', '2': 'दु', '3': 'तीन', '4': 'चारि', '5': 'पाँच', '6': 'छ', '7': 'सात', '8': 'आठ', '9': 'नौ' },
  kru: { '0': 'शून्य', '1': 'ओन्द', '2': 'एन्द', '3': 'मून्द', '4': 'नाख', '5': 'पंचे', '6': 'सोए', '7': 'साते', '8': 'आठे', '9': 'नवे' },
  bn: { '0': 'শূন্য', '1': 'এক', '2': 'দুই', '3': 'তিন', '4': 'চার', '5': 'পাঁচ', '6': 'ছয়', '7': 'সাত', '8': 'আট', '9': 'নয়' },
  or: { '0': 'ଶୂନ୍ୟ', '1': 'ଏକ', '2': 'ଦୁଇ', '3': 'ତିନି', '4': 'ଚାରି', '5': 'ପାଞ୍ଚ', '6': 'ଛଅ', '7': 'ସାତ', '8': 'ଆଠ', '9': 'ନଅ' },
};

// Language preview prompts: "If you speak [Language], tap here."
export const LANGUAGE_AUDITION_PROMPTS: Record<string, string> = {
  hi: 'अगर आप हिंदी बोलते हैं, तो यहाँ दबाएँ।',
  en: 'If you speak English, tap here.',
  sat: 'आम संताली तेम रोड़ खान, नोंडे ओताय मे।',
  kht: 'जदि तोहीन खोरठा बोलहा, त इहाँ दबाहा।',
  nag: 'जदि रउरे मन नागपुरी बोलिला, त इहाँ दबाऊ।',
  bho: 'रउआ अगर भोजपुरी बोलत बानी, त इहाँ दबाईं।',
  anp: 'जँ अपने अंगिका बोलै छियै, त इहाँ दबाबियै।',
  mag: 'जँ अपने मगही बोलही, त इहाँ दबावी।',
  mai: 'जँ अहाँ मैथिली बजैत छी, त एतय दबाउ।',
  kru: 'नीम कुड़ुख़ कत्थारो, होले इया ओत्ता।',
  or: 'ଯଦି ଆପଣ ଓଡ଼ିଆ କହୁଛନ୍ତି, ତେବେ ଏଠାରେ ଦବାନ୍ତୁ।',
  bn: 'আপনি যদি বাংলায় কথা বলেন, তবে এখানে চাপুন।',
};

// Walkthrough narration prompts per slide
export const WALKTHROUGH_SLIDES = [
  {
    id: 'photo',
    icon: 'camera',
    titleHi: '१. समस्या की फोटो लें',
    titleEn: '1. Take a Photo',
    audioText: {
      hi: 'यहाँ दबाकर समस्या की फोटो खींचें, जैसे सड़क का गड्ढा या टूटा हुआ नल।',
      sat: 'नोंडे ओताय कते एटकैटोणे रेनाग् फोटो तुलाउ मे।',
      kht: 'इहाँ दबाके समस्या केर फोटो खींचहा, जइसे सड़क केर गड्ढा चाहे टूटल नल।',
      nag: 'इहाँ दबाय के समस्या कर फोटो खींचू, जइसे सड़क कर गड्ढा चाहे टूटल नल।',
      bho: 'इहाँ दबाके समस्या के फोटो खींचीं, जइसे सड़क के गड्ढा चाहे टूटल नल।',
      anp: 'इहाँ दबाबी क समस्या के फोटो खींची, जैसन सड़क के गड्ढा चाहे टूटल नल।',
      mag: 'इहाँ दबावी के समस्या के फोटो खींची, जैसन सड़क के गड्ढा चाहे टूटल नल।',
      mai: 'एतय दबाउ कऽ समस्याक फोटो खींचू, जेना सड़कक गड्ढा वा टूटल नल।',
      kru: 'इया ओत्ता अरा समस्या गही फोटो ओत्ता, जेसन सड़क गही गड्ढा मला टूटल नल।',
      bn: 'এখানে চেপে সমস্যার ছবি তুলুন, যেমন ভাঙা রাস্তা বা কল।',
      or: 'ଏଠାରେ ଦବାଇ ସମସ୍ୟାର ଫଟୋ ଉଠାନ୍ତୁ, ଯେପରିକି ଭଙ୍ଗା ରାସ୍ତା ବା ପାଇପ୍।',
      en: 'Tap here to take a photo of the problem, like a broken road or water pipe.',
    },
  },
  {
    id: 'voice',
    icon: 'mic',
    titleHi: '२. बोलकर समस्या बताएं',
    titleEn: '2. Speak your Grievance',
    audioText: {
      hi: 'लिखने की जरूरत नहीं है, माइक बटन दबाएं और अपनी भाषा में बोलकर बताएं।',
      sat: 'ओलोः रेनाग् ज़रूरत बानूक्-आ, माइक बटन ओताय मे आर अपन पारसी ते रोड़ मे।',
      kht: 'लिखेक कोनो दरकार नाय छौ, माइक बटन दबाहा आर अपन भाखा में बोलहा।',
      nag: 'लिखेक दरकार नइखे, माइक बटन दबाऊ आर आपन भाखा में बोल के बताऊ।',
      bho: 'लिखे के कवनो जरूरत नइखे, माइक बटन दबाईं आ आपन बोली में बोलीं।',
      anp: 'लिखे के कोनो दरकार नइखे, माइक बटन दबाबी आर अपन बोली मँ बोलियै।',
      mag: 'लिखे के दरकार नइखे, माइक बटन दबावी आ आपन बोली में बतावी।',
      mai: 'लिखबाक कोनो आवश्यकता नहि अछि, माइक बटन दबाउ आ अपन भाषामे बाजु।',
      kru: 'टुड़\'ना गही दरकार मला रई, माइक बटन ओत्ता अरा अपन कत्था ती तेंगा।',
      bn: 'লেখার দরকার নেই, মাইক বোতাম চেপে নিজের ভাষায় বলুন।',
      or: 'ଲେଖିବା ଆବଶ୍ୟକ ନାହିଁ, ମାଇକ୍ ବଟନ୍ ଦବାଇ ନିଜ ଭାଷାରେ କୁହନ୍ତୁ।',
      en: 'No need to type, just press the mic button and speak in your language.',
    },
  },
  {
    id: 'location',
    icon: 'map-pin',
    titleHi: '३. जगह अपने आप दर्ज होगी',
    titleEn: '3. Location Auto-detected',
    audioText: {
      hi: 'आपकी जगह फोन अपने आप पहचान लेगा, बस हरे बटन पर सही का निशान दबाएं।',
      sat: 'आमाग् जायगा फोन आस्ते ते बाछाव-आ, शुधु हरियर बटन ओताय मे।',
      kht: 'तोहर जगह फोन अपने आप बुझि लेतौ, खाली हरियर सही बटन दबाहा।',
      nag: 'तोहर जगह फोन अपने आप पहचान लेवी, बस हरियर सही बटन दबाऊ।',
      bho: 'रउआ जगह फोन अपने आप पहचान ली, बस हरियर सही बटन दबाईं।',
      anp: 'अपने के जगह फोन अपने पहचानी लेतै, बस हरियर सही बटन दबाबियै।',
      mag: 'अपने के जगह फोन अपने पहचान लेतई, बस हरियर सही बटन दबावी।',
      mai: 'अहाँक स्थान फोन अपने पहचानि लेत, केवल हरियर सही बटन दबाउ।',
      kru: 'नीमहाय जगहा फोन अपने चिन्ह\'ओ, बस हरियर सही बटन ओत्ता।',
      bn: 'আপনার অবস্থান ফোন নিজে চিনে নেবে, কেবল সবুজ ঠিক বোতাম চাপুন।',
      or: 'ଆପଣଙ୍କ ସ୍ଥାନ ଫୋନ୍ ନିଜେ ଚିହ୍ନିବ, କେବଳ ସବୁଜ ଠିକ୍ ବଟନ୍ ଦବାନ୍ତୁ।',
      en: 'Your location will be auto-detected, just confirm with the green check button.',
    },
  },
  {
    id: 'track',
    icon: 'check-circle',
    titleHi: '४. भेजें और काम होते देखें',
    titleEn: '4. Submit & Track Progress',
    audioText: {
      hi: 'बटन दबाकर शिकायत भेजें, और फोन पर सूचना पाएं कि काम कब पूरा हुआ।',
      sat: 'बटन ओताय कते रिपोर्ट कुल मे, आर ञेल मे काम तिसरे पूराव-आ।',
      kht: 'बटन दबाके शिकायत भेजहा, आर सूचना पइहा कि काम कहिया पूरा भेलौ।',
      nag: 'बटन दबाय के शिकायत भेजू, आर देखू कि काम कहिया पूरा होवत आहे।',
      bho: 'बटन दबाके सिकायत भेजीं, आ देखीं कि काम कब पूरा हो रहल बा।',
      anp: 'बटन दबाबी क शिकायत भेजी, आर देखी कि काम कहिया पूरा भेलै।',
      mag: 'बटन दबावी के शिकायत भेजी, आ देखी कि काम कहिया पूरा भेलई।',
      mai: 'बटन दबाउ कऽ शिकायत भेजू, आ देखू जे काज कहिया पूरा भेल।',
      kru: 'बटन ओत्ता अरा रिपोर्ट तइ\'आ, अरा एर\'आ जे काम एका बेरा पूरा मंज्जा।',
      bn: 'বোতাম চেপে অভিযোগ পাঠান, এবং কাজের অগ্রগতি ফোনে দেখুন।',
      or: 'ବଟନ୍ ଦବାଇ ଅଭିଯୋଗ ପଠାନ୍ତୁ, ଏବଂ କାର୍ଯ୍ୟର ଅଗ୍ରଗତି ଫୋନରେ ଦେଖନ୍ତୁ।',
      en: 'Press submit, and track the live progress until your grievance is resolved.',
    },
  },
];

// In-app pre-permission audio instructions before OS dialog appears
export const PRE_PERMISSION_AUDIO: Record<'camera' | 'location' | 'microphone', Record<string, string>> = {
  camera: {
    hi: 'अभी फोन पर एक सवाल आएगा। फोटो लेने के लिए हरे बटन या Allow को दबाना।',
    sat: 'अकुन फोन रे कुकली हिजुग्-आ। फोटो लागिद् हरियर बटन अलाउ ओताय मे।',
    kht: 'अखन फोन में एक सवाल आयतौ। फोटो लेवेक लेल हरियर अलाउ बटन दबाहा।',
    nag: 'अखन फोन में एक सवाल आवी। फोटो लेवेक लेल हरियर अलाउ बटन दबाऊ।',
    bho: 'अबहिन फोन में एगो सवाल आई। फोटो खींचे खातिर हरियर अलाउ बटन दबाईं।',
    anp: 'अखन फोन मँ एगो सवाल अएतै। फोटो लेबे लेल हरियर अलाउ बटन दबाबियै।',
    mag: 'अखन फोन में सवाल अयतई। फोटो लेवे खातिर हरियर अलाउ बटन दबावी।',
    mai: 'अखन फोन पर प्रश्न आयत। फोटो खींचबाक लेल हरियर अलाउ बटन दबाउ।',
    kru: 'अकुन फोन नु सवाल बरो। फोटो ओत्तागे हरियर अलाउ बटन ओत्ता।',
    bn: 'এখন ফোনে একটি অনুমতি চাইবে। ছবি তোলার জন্য সবুজ Allow বোতাম চাপুন।',
    or: 'ବର୍ତ୍ତମାନ ଫୋନରେ ଅନୁମତି ମାଗିବ। ଫଟୋ ଉଠାଇବାକୁ ସବୁଜ Allow ବଟନ୍ ଦବାନ୍ତୁ।',
    en: 'A system popup will appear now. Tap the green Allow button to enable camera.',
  },
  location: {
    hi: 'अभी फोन पर एक सवाल आएगा। आपकी जगह जानने के लिए While using app या हरे बटन को दबाना।',
    sat: 'अकुन फोन रे कुकली हिजुग्-आ। जायगा लागिद् हरियर बटन अलाउ ओताय मे।',
    kht: 'अखन फोन में सवाल आयतौ। जगह लेवेक लेल व्हाइल यूजिंग ऐप चाहे हरियर बटन दबाहा।',
    nag: 'अखन फोन में सवाल आवी। जगह लेवेक लेल व्हाइल यूजिंग ऐप चाहे हरियर बटन दबाऊ।',
    bho: 'अबहिन फोन में सवाल आई। जगह जाने खातिर व्हाइल यूजिंग ऐप चाहे हरियर बटन दबाईं।',
    anp: 'अखन फोन मँ सवाल अएतै। जगह लेबे लेल हरियर अलाउ बटन दबाबियै।',
    mag: 'अखन फोन में सवाल अयतई। जगह खातिर व्हाइल यूजिंग ऐप चाहे हरियर बटन दबावी।',
    mai: 'अखन फोन पर प्रश्न आयत। स्थानक लेल व्हाइल यूजिंग ऐप वा हरियर बटन दबाउ।',
    kru: 'अकुन फोन नु सवाल बरो। जगहा लागे व्हाइल यूजिंग ऐप हरियर बटन ओत्ता।',
    bn: 'এখন ফোনে অনুমতি চাইবে। আপনার অবস্থানের জন্য While using app বা সবুজ বোতাম চাপুন।',
    or: 'ଫୋନରେ ଅନୁମତି ମାଗିବ। ସ୍ଥାନ ଜାଣିବା ପାଇଁ While using app ବା ସବୁଜ ବଟନ୍ ଦବାନ୍ତୁ।',
    en: 'A location popup will appear. Tap While using app or the green button to continue.',
  },
  microphone: {
    hi: 'अभी फोन पर एक सवाल आएगा। अपनी आवाज रिकॉर्ड करने के लिए हरे बटन या Allow को दबाना।',
    sat: 'अकुन फोन रे कुकली हिजुग्-आ। रोड़ रिकॉर्ड लागिद् हरियर बटन अलाउ ओताय मे।',
    kht: 'अखन फोन में सवाल आयतौ। आवाज रिकॉर्ड करेक लेल हरियर अलाउ बटन दबाहा।',
    nag: 'अखन फोन में सवाल आवी। आवाज रिकॉर्ड करेक लेल हरियर अलाउ बटन दबाऊ।',
    bho: 'अबहिन फोन में सवाल आई। आवाज रिकॉर्ड करे खातिर हरियर अलाउ बटन दबाईं।',
    anp: 'अखन फोन मँ सवाल अएतै। आवाज रिकॉर्ड करे लेल हरियर अलाउ बटन दबाबियै।',
    mag: 'अखन फोन में सवाल अयतई। आवाज रिकॉर्ड करे खातिर हरियर अलाउ बटन दबावी।',
    mai: 'अखन फोन पर प्रश्न आयत। आवाज रिकॉर्ड करबाक लेल हरियर अलाउ बटन दबाउ।',
    kru: 'अकुन फोन नु सवाल बरो। साड़ा रिकॉर्ड ननागे हरियर अलाउ बटन ओत्ता।',
    bn: 'এখন ফোনে অনুমতি চাইবে। কণ্ঠস্বর রেকর্ডের জন্য সবুজ Allow বোতাম চাপুন।',
    or: 'ଫୋନରେ ଅନୁମତି ମାଗିବ। କଣ୍ଠସ୍ୱର ରେକର୍ଡ କରିବାକୁ ସବୁଜ Allow ବଟନ୍ ଦବାନ୍ତୁ।',
    en: 'A microphone popup will appear. Tap the green Allow button to record your voice.',
  },
};

/**
 * Stop any ongoing audio playback immediately.
 */
export async function stopSpeech(): Promise<void> {
  try {
    if (activeSound) {
      if (typeof activeSound.pause === 'function') activeSound.pause();
      if (typeof activeSound.unloadAsync === 'function') await activeSound.unloadAsync();
      activeSound = null;
    }
    if (SpeechModule && typeof SpeechModule.stop === 'function') {
      await SpeechModule.stop();
    }
  } catch {}
}

/**
 * Synthesize and play speech in the target language.
 * Uses Bhashini TTS with native audio caching, falls back to Expo Speech.
 */
export async function playSpeech(text: string, language: string = 'hi'): Promise<void> {
  if (!text || !text.trim()) return;
  await stopSpeech();

  const effectiveLang = resolveVoiceLanguage(language);

  try {
    const audioBase64 = await synthesizeSpeech(text, effectiveLang);
    let fileUri = `data:audio/wav;base64,${audioBase64}`;

    if (FileSystemModule && FileSystemModule.cacheDirectory) {
      try {
        const tempPath = `${FileSystemModule.cacheDirectory}samadhan_voice_${Date.now()}.wav`;
        await FileSystemModule.writeAsStringAsync(tempPath, audioBase64, {
          encoding: FileSystemModule.EncodingType?.Base64 || 'base64',
        });
        fileUri = tempPath;
      } catch {}
    }

    // 1. Try modern expo-audio
    if (ExpoAudioModule && typeof ExpoAudioModule.createAudioPlayer === 'function') {
      try {
        const player = ExpoAudioModule.createAudioPlayer(fileUri);
        player.play();
        activeSound = player;
        return;
      } catch (e) {
        console.warn('[VoiceFeedback] expo-audio failed, falling back to expo-av:', e);
      }
    }

    // 2. Try legacy expo-av
    if (ExpoAvModule && typeof ExpoAvModule.Sound?.createAsync === 'function') {
      const { sound } = await ExpoAvModule.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );
      activeSound = sound;
      return;
    }
  } catch (err) {
    console.warn('[VoiceFeedback] Bhashini playback failed, falling back to device speech:', err);
  }

  // 3. Fallback: Expo Speech
  if (SpeechModule && typeof SpeechModule.speak === 'function') {
    const speechLangMap: Record<string, string> = {
      bn: 'bn-IN',
      or: 'or-IN',
      hi: 'hi-IN',
      en: 'en-IN',
    };
    const deviceLang = speechLangMap[effectiveLang] || 'hi-IN';
    SpeechModule.speak(text, { language: deviceLang, rate: 0.95 });
  }
}

/**
 * Speak a single numeric digit aloud in the given language.
 */
export async function speakDigit(digit: string, language: string = 'hi'): Promise<void> {
  const langKey = language.toLowerCase();
  const digitWord = (SPOKEN_DIGITS[langKey] && SPOKEN_DIGITS[langKey][digit]) ||
    (SPOKEN_DIGITS.hi[digit] || digit);
  await playSpeech(digitWord, language);
}

/**
 * Speak a language preview sample: "अगर आप [भाषा] बोलते हैं, तो यहाँ दबाएँ".
 */
export async function playLanguageAudioSample(languageCode: string): Promise<void> {
  const prompt = LANGUAGE_AUDITION_PROMPTS[languageCode] || LANGUAGE_AUDITION_PROMPTS.hi;
  await playSpeech(prompt, languageCode);
}

/**
 * Speak a dynamic runtime alert (error, success, confirmation) aloud immediately.
 */
export async function speakDynamicAlert(message: string, language: string = 'hi'): Promise<void> {
  await playSpeech(message, language);
}
