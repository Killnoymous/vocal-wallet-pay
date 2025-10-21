export interface UPIDetails {
  payeeVPA?: string;
  payeeName?: string;
  amount?: number;
  transactionNote?: string;
  merchantCode?: string;
  transactionRef?: string;
}

export const parseUPIQR = (qrData: string): UPIDetails | null => {
  try {
    // UPI QR format: upi://pay?pa=<VPA>&pn=<Name>&am=<Amount>&tn=<Note>&mc=<MerchantCode>&tr=<TransactionRef>
    if (!qrData.startsWith('upi://pay')) {
      return null;
    }

    const url = new URL(qrData);
    const params = url.searchParams;

    return {
      payeeVPA: params.get('pa') || undefined,
      payeeName: params.get('pn') || undefined,
      amount: params.get('am') ? parseFloat(params.get('am')!) : undefined,
      transactionNote: params.get('tn') || undefined,
      merchantCode: params.get('mc') || undefined,
      transactionRef: params.get('tr') || undefined,
    };
  } catch (error) {
    console.error('Failed to parse UPI QR:', error);
    return null;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const parseVoiceAmount = (transcript: string): number | null => {
  // Normalize the transcript
  const normalized = transcript.toLowerCase().trim();
  
  // Remove common filler words
  const cleaned = normalized
    .replace(/rupees?|rs\.?|₹/gi, '')
    .replace(/and|paisa?|paise/gi, '')
    .trim();

  // Try to extract numbers
  const numbers = cleaned.match(/\d+/g);
  if (!numbers) {
    // Try to parse word numbers
    return parseWordNumbers(cleaned);
  }

  // Handle cases like "2000 34" -> 2000.34
  if (numbers.length === 2) {
    return parseFloat(`${numbers[0]}.${numbers[1]}`);
  }

  // Single number
  return parseFloat(numbers[0]);
};

const parseWordNumbers = (text: string): number | null => {
  const wordToNum: { [key: string]: number } = {
    zero: 0, one: 1, two: 2, three: 3, four: 4,
    five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
    fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
    twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90,
    hundred: 100, thousand: 1000, lakh: 100000, crore: 10000000,
  };

  const words = text.split(/\s+/);
  let total = 0;
  let current = 0;

  for (const word of words) {
    const num = wordToNum[word];
    if (num !== undefined) {
      if (num >= 100) {
        current = current === 0 ? num : current * num;
        if (num >= 1000) {
          total += current;
          current = 0;
        }
      } else {
        current += num;
      }
    }
  }

  total += current;
  return total > 0 ? total : null;
};
