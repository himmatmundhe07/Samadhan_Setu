/**
 * Samadhan Setu — Jharkhand Districts
 * All 24 districts with Hindi and English names.
 * Used for location dropdown in registration and submit flows.
 */

export interface District {
  id: string;
  nameHi: string;
  nameEn: string;
}

export const districts: District[] = [
  { id: 'bokaro', nameHi: 'बोकारो', nameEn: 'Bokaro' },
  { id: 'chatra', nameHi: 'चतरा', nameEn: 'Chatra' },
  { id: 'deoghar', nameHi: 'देवघर', nameEn: 'Deoghar' },
  { id: 'dhanbad', nameHi: 'धनबाद', nameEn: 'Dhanbad' },
  { id: 'dumka', nameHi: 'दुमका', nameEn: 'Dumka' },
  { id: 'east_singhbhum', nameHi: 'पूर्वी सिंहभूम', nameEn: 'East Singhbhum' },
  { id: 'garhwa', nameHi: 'गढ़वा', nameEn: 'Garhwa' },
  { id: 'giridih', nameHi: 'गिरिडीह', nameEn: 'Giridih' },
  { id: 'godda', nameHi: 'गोड्डा', nameEn: 'Godda' },
  { id: 'gumla', nameHi: 'गुमला', nameEn: 'Gumla' },
  { id: 'hazaribagh', nameHi: 'हजारीबाग', nameEn: 'Hazaribagh' },
  { id: 'jamtara', nameHi: 'जामताड़ा', nameEn: 'Jamtara' },
  { id: 'khunti', nameHi: 'खूँटी', nameEn: 'Khunti' },
  { id: 'koderma', nameHi: 'कोडरमा', nameEn: 'Koderma' },
  { id: 'latehar', nameHi: 'लातेहार', nameEn: 'Latehar' },
  { id: 'lohardaga', nameHi: 'लोहरदगा', nameEn: 'Lohardaga' },
  { id: 'pakur', nameHi: 'पाकुड़', nameEn: 'Pakur' },
  { id: 'palamu', nameHi: 'पलामू', nameEn: 'Palamu' },
  { id: 'ramgarh', nameHi: 'रामगढ़', nameEn: 'Ramgarh' },
  { id: 'ranchi', nameHi: 'राँची', nameEn: 'Ranchi' },
  { id: 'sahebganj', nameHi: 'साहेबगंज', nameEn: 'Sahebganj' },
  { id: 'seraikela_kharsawan', nameHi: 'सरायकेला खरसावाँ', nameEn: 'Seraikela Kharsawan' },
  { id: 'simdega', nameHi: 'सिमडेगा', nameEn: 'Simdega' },
  { id: 'west_singhbhum', nameHi: 'पश्चिमी सिंहभूम', nameEn: 'West Singhbhum' },
];

export const getDistrictById = (id: string): District | undefined =>
  districts.find((d) => d.id === id);

export const getDistrictName = (id: string, lang: string = 'hi'): string => {
  const district = getDistrictById(id);
  if (!district) return id;
  return lang === 'en' ? district.nameEn : district.nameHi;
};
