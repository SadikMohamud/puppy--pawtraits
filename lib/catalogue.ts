// Single source of truth for the portfolio and the print shop.
// Prices live here and are read on the server at checkout, so the browser can never set its own price.
//
// Photos: these are stand-ins from Unsplash (free to use under the Unsplash Licence), chosen to show the
// design with real photography. Replace each `image` with Jason's own work in /public/work before launch.
// Photographers are listed in `credit` so the stand-ins are easy to trace.

export type Category = 'Studio' | 'Outdoor' | 'Puppies';

export interface Work {
  id: string;
  name: string;
  breed: string;
  category: Category;
  image: string;
  width: number;
  height: number;
  /** Where the dog sits in the frame, used as object-position for tight crops. */
  focus?: string;
  credit: string;
}

export interface PrintSize {
  id: string;
  label: string;
  dimensions: string;
  /** Price in pence. */
  price: number;
}

export interface Print {
  id: string;
  workId: string;
  title: string;
  edition: string;
  paper: string;
}

export const currency = 'gbp';

const w = (
  id: string,
  name: string,
  breed: string,
  category: Category,
  width: number,
  height: number,
  credit: string,
  focus?: string,
): Work => ({ id, name, breed, category, image: `/work/${id}.jpg`, width, height, credit, focus });

export const works: Work[] = [
  w('ruby', 'Ruby', 'Chocolate Labrador', 'Studio', 1600, 2400, 'Taylor Kopel'),
  w('snow', 'Snow', 'Japanese Spitz', 'Studio', 1600, 2000, 'Nicolás Pinilla', '50% 35%'),
  w('nell', 'Nell', 'Australian Shepherd', 'Outdoor', 1600, 1067, 'Anton Borzenkov', '45% 40%'),
  w('olive', 'Olive', 'Pug', 'Studio', 1600, 900, 'Heliberto Arias'),
  w('scout', 'Scout', 'Labrador pup', 'Puppies', 1600, 2400, 'Taylor Kopel', '50% 30%'),
  w('heather', 'Heather', 'Puli', 'Outdoor', 1600, 2167, 'karolina skiścim'),
  w('bruno', 'Bruno', 'Boxer cross', 'Studio', 1600, 1067, 'Ingo W. Dühring', '40% 40%'),
  w('pip', 'Pip', 'German Shepherd pup', 'Puppies', 1600, 2400, 'Alexander Naglestad', '50% 60%'),
  w('hamish', 'Hamish', 'West Highland Terrier', 'Studio', 1600, 2000, 'Nicolás Pinilla', '50% 35%'),
  w('wilf', 'Wilf', 'Wolfhound cross', 'Outdoor', 1600, 1067, 'Jordan Heinz'),
  w('biscuit', 'Biscuit', 'Staffie pup', 'Puppies', 1600, 1977, 'Pablo Meza'),
  w('ink', 'Ink', 'Border Collie', 'Studio', 1600, 1946, 'Hyunwon Jang'),
  w('juno', 'Juno', 'Siberian Husky', 'Outdoor', 1600, 2134, 'ello', '50% 30%'),
  w('rufus', 'Rufus', 'Dachshund', 'Studio', 1600, 2000, 'Nicolás Pinilla', '50% 30%'),
  w('honey', 'Honey', 'Labrador pup', 'Puppies', 1600, 2388, 'Taylor Kopel', '60% 35%'),
  w('peanut', 'Peanut', 'Long-haired Chihuahua', 'Studio', 1600, 1280, 'Erwin Bosman'),
  w('tiger', 'Tiger', 'Dutch Shepherd', 'Outdoor', 1600, 2133, 'Haberdoedas'),
  w('duke', 'Duke', 'Kelpie cross', 'Studio', 1600, 2000, 'Jane Thomson', '50% 30%'),
  w('skye', 'Skye', 'Bulldog cross', 'Outdoor', 1600, 2400, 'Henry Ravenscroft', '50% 60%'),
  w('bear', 'Bear', 'Scottish Terrier', 'Studio', 1600, 2400, 'Caio Santos'),
  w('pudding', 'Pudding', 'Pug', 'Outdoor', 1600, 2400, 'Ahmed Zayan', '50% 40%'),
  w('cocoa', 'Cocoa', 'Mastiff cross', 'Studio', 1600, 900, 'Lj. Filipović'),
];

/** Dogs given the large treatment in The Sitters slideshow. */
export const sitters = ['ruby', 'snow', 'scout', 'hamish', 'juno', 'duke', 'heather'];

export const sizes: PrintSize[] = [
  { id: 'a4', label: 'A4', dimensions: '21 × 29.7 cm', price: 4500 },
  { id: 'a3', label: 'A3', dimensions: '29.7 × 42 cm', price: 7500 },
  { id: 'a2', label: 'A2', dimensions: '42 × 59.4 cm', price: 12000 },
];

const paper = 'Hahnemühle Photo Rag 308gsm';

export const prints: Print[] = [
  { id: 'ruby-print', workId: 'ruby', title: 'Ruby, Red Scarf', edition: 'Open edition', paper },
  { id: 'nell-print', workId: 'nell', title: 'Nell at Last Light', edition: 'Limited to 50', paper },
  { id: 'snow-print', workId: 'snow', title: 'Snow, Grinning', edition: 'Open edition', paper },
  { id: 'heather-print', workId: 'heather', title: 'Heather in the Heather', edition: 'Limited to 50', paper },
  { id: 'scout-print', workId: 'scout', title: 'Scout, Eight Weeks', edition: 'Open edition', paper },
  { id: 'ink-print', workId: 'ink', title: 'Ink, in Profile', edition: 'Limited to 50', paper },
];

/** Flat UK shipping in pence, offered at Stripe Checkout. */
export const shipping = { standard: 595, tracked: 995 };

export const findWork = (id: string) => works.find((work) => work.id === id);
export const findPrint = (id: string) => prints.find((print) => print.id === id);
export const findSize = (id: string) => sizes.find((size) => size.id === id);

export function formatPrice(pence: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 0 }).format(pence / 100);
}
