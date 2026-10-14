window.CC = window.CC || {};
(function (CC) {

CC.CATEGORY_TREE = {
  "Tops": ["T-shirt","Blouse","Sweater & Knit","Cardigan","Hoodie","Jersey","Polo","Sweatshirt","Button-down & Shirt","Camisole","Tank Top","Crop Top","Tunic","Graphic Tee","Going Out Top","Strapless","Vest","Other"],
  "Bottoms": ["Jeans & Denim","Pants","Skirt","Shorts","Skort","Sweatpants","Leggings","Stockings, Hosiery, & Tights","Other"],
  "One pieces": ["Bodysuit","Unitard","Other"],
  "Dresses & Jumpsuits": ["Mini Dress","Midi Dress","Maxi Dress","Romper","Jumpsuit","Other"],
  "Outerwear": ["Heavy Winter Wear","Coat","Jacket","Blazer","Trench Coat","Vest","Other"],
  "Sleepwear & Loungewear": ["Sleepwear","Bralette","Loungewear","Other"],
  "Footwear": ["Shoes","Sandals","Flats","Sneakers","Gym Shoes & Trainers","Loafers","Slip-ons","Clogs","Mules","Boots","Heels","Oxford/Derby","Wedges","Other"],
  "Bags": ["Tote","Shoulder","Satchel","Doctor & Boston","Top Handle","Crossbody","Clutch","Wristlet","Duffel & Weekender","Backpack","Belt/Sling","Briefcase","Bucket","Hobo","Baguette","Basket/Woven","Other"],
  "Accessories": ["Sunglasses","Scarf","Bag Charm","Headwear & Hair","Neckwear","Handwear","Belt","Jewelry","Other"],
  "Activewear": ["Leggings","Tights","Joggers & Track Pants","Active Shorts","Active Top","Other"],
  "Formalwear": ["Corset & Bustier","Minaudières","Ultra-Formal (White Tie)","Semi-Formal/Formal (Black Tie)","Daytime Formal","Cocktail Attire","Other"],
  "Matching Sets": ["Suit Set","Skirt & Top Set","Sweater & Knit Set","Shirt & Short/Pant Set","Other"]
};
CC.CATEGORIES = Object.keys(CC.CATEGORY_TREE);
CC.JEWELRY_METALS = ["Gold","Silver","Rose Gold","Platinum","Titanium","Stainless Steel","Brass","Gold-Plated","Vermeil","Gold-Filled"];

CC.CATEGORY_ICON = {
  "Tops":"👕","Bottoms":"👖","One pieces":"🩱","Dresses & Jumpsuits":"👗","Outerwear":"🧥",
  "Sleepwear & Loungewear":"🩴","Footwear":"👟","Bags":"👜","Accessories":"🧣","Activewear":"🩳",
  "Formalwear":"🤵","Matching Sets":"👔"
};
CC.WEAR_DEFAULT = {
  "Tops":30,"Bottoms":40,"One pieces":25,"Dresses & Jumpsuits":15,"Outerwear":80,
  "Sleepwear & Loungewear":60,"Footwear":100,"Bags":150,"Accessories":50,"Activewear":60,
  "Formalwear":8,"Matching Sets":20
};

CC.COLOURS = [
  {name:"Black",hex:"#1C1B18"},{name:"White",hex:"#F5F3EF"},{name:"Grey",hex:"#9A9893"},
  {name:"Beige / Tan",hex:"#D2B48C"},{name:"Brown",hex:"#8B5A3C"},{name:"Navy",hex:"#1F2F55"},
  {name:"Blue",hex:"#4A7BC8"},{name:"Green",hex:"#5A9A5A"},{name:"Yellow",hex:"#E8C547"},
  {name:"Orange",hex:"#E88A3C"},{name:"Red",hex:"#C0392B"},{name:"Pink",hex:"#E8A0B4"},
  {name:"Purple",hex:"#8E6BB5"},{name:"Multicolor / Print",hex:"conic-gradient(#e8a0b4,#e8c547,#5a9a5a,#4a7bc8,#8e6bb5,#e8a0b4)"}
];
CC.COLOUR_NAMES = CC.COLOURS.map(function (c) { return c.name; });
CC.COLOUR_HEX = {};
CC.COLOURS.forEach(function (c) { CC.COLOUR_HEX[c.name] = c.hex; });

CC.SEASONS = ["Spring","Summer","Fall","Winter","All-season"];
CC.SOURCES = ["Purchase","Gift","Hand-Made"];

var C = [
  ["USD","United States Dollar","$"],["EUR","Euro","€"],["GBP","British Pound Sterling","£"],
  ["CAD","Canadian Dollar","$"],["AUD","Australian Dollar","$"],["JPY","Japanese Yen","¥"],
  ["AED","United Arab Emirates Dirham","د.إ"],["AFN","Afghan Afghani","؋"],["ALL","Albanian Lek","L"],
  ["AMD","Armenian Dram","֏"],["AOA","Angolan Kwanza","Kz"],["ARS","Argentine Peso","$"],
  ["AZN","Azerbaijani Manat","₼"],["BAM","Bosnia and Herzegovina Convertible Mark","KM"],
  ["BDT","Bangladeshi Taka","৳"],["BGN","Bulgarian Lev","лв"],["BHD","Bahraini Dinar","BD"],
  ["BIF","Burundian Franc","FBu"],["BND","Brunei Dollar","$"],["BOB","Bolivian Boliviano","Bs."],
  ["BRL","Brazilian Real","R$"],["BSD","Bahamian Dollar","$"],["BTN","Bhutanese Ngultrum","Nu."],
  ["BWP","Botswana Pula","P"],["BYN","Belarusian Ruble","Br"],["BZD","Belize Dollar","$"],
  ["CDF","Congolese Franc","FC"],["CHF","Swiss Franc","CHF"],["CLP","Chilean Peso","$"],
  ["CNY","Chinese Yuan","¥"],["COP","Colombian Peso","$"],["CRC","Costa Rican Colón","₡"],
  ["CUP","Cuban Peso","$"],["CVE","Cape Verdean Escudo","$"],["CZK","Czech Koruna","Kč"],
  ["DJF","Djiboutian Franc","Fdj"],["DKK","Danish Krone","kr"],["DOP","Dominican Peso","$"],
  ["DZD","Algerian Dinar","DA"],["EGP","Egyptian Pound","E£"],["ERN","Eritrean Nakfa","Nfk"],
  ["ETB","Ethiopian Birr","Br"],["FJD","Fijian Dollar","$"],["GEL","Georgian Lari","₾"],
  ["GHS","Ghanaian Cedi","₵"],["GMD","Gambian Dalasi","D"],["GNF","Guinean Franc","FG"],
  ["GTQ","Guatemalan Quetzal","Q"],["GYD","Guyanese Dollar","$"],["HNL","Honduran Lempira","L"],
  ["HTG","Haitian Gourde","G"],["HUF","Hungarian Forint","Ft"],["IDR","Indonesian Rupiah","Rp"],
  ["ILS","Israeli New Shekel","₪"],["INR","Indian Rupee","₹"],["IQD","Iraqi Dinar","IQD"],
  ["IRR","Iranian Rial","﷼"],["ISK","Icelandic Króna","kr"],["JMD","Jamaican Dollar","$"],
  ["JOD","Jordanian Dinar","JD"],["KES","Kenyan Shilling","KSh"],["KGS","Kyrgyzstani Som","с"],
  ["KHR","Cambodian Riel","៛"],["KMF","Comorian Franc","CF"],["KPW","North Korean Won","₩"],
  ["KRW","South Korean Won","₩"],["KWD","Kuwaiti Dinar","KD"],["KZT","Kazakhstani Tenge","₸"],
  ["LAK","Lao Kip","₭"],["LBP","Lebanese Pound","L£"],["LKR","Sri Lankan Rupee","Rs"],
  ["LRD","Liberian Dollar","$"],["LSL","Lesotho Loti","L"],["LYD","Libyan Dinar","LD"],
  ["MAD","Moroccan Dirham","MAD"],["MDL","Moldovan Leu","L"],["MGA","Malagasy Ariary","Ar"],
  ["MKD","Macedonian Denar","ден"],["MMK","Myanmar Kyat","K"],["MNT","Mongolian Tögrög","₮"],
  ["MRU","Mauritanian Ouguiya","UM"],["MUR","Mauritian Rupee","₨"],["MVR","Maldivian Rufiyaa","Rf"],
  ["MWK","Malawian Kwacha","MK"],["MXN","Mexican Peso","$"],["MYR","Malaysian Ringgit","RM"],
  ["MZN","Mozambican Metical","MT"],["NAD","Namibian Dollar","$"],["NGN","Nigerian Naira","₦"],
  ["NIO","Nicaraguan Córdoba","C$"],["NOK","Norwegian Krone","kr"],["NPR","Nepalese Rupee","₨"],
  ["NZD","New Zealand Dollar","$"],["OMR","Omani Rial","OMR"],["PAB","Panamanian Balboa","B/."],
  ["PEN","Peruvian Sol","S/"],["PGK","Papua New Guinean Kina","K"],["PHP","Philippine Peso","₱"],
  ["PKR","Pakistani Rupee","₨"],["PLN","Polish Złoty","zł"],["PYG","Paraguayan Guaraní","₲"],
  ["QAR","Qatari Riyal","QR"],["RON","Romanian Leu","lei"],["RSD","Serbian Dinar","дин."],
  ["RUB","Russian Ruble","₽"],["RWF","Rwandan Franc","FRw"],["SAR","Saudi Riyal","SR"],
  ["SBD","Solomon Islands Dollar","$"],["SCR","Seychellois Rupee","₨"],["SDG","Sudanese Pound","SDG"],
  ["SEK","Swedish Krona","kr"],["SGD","Singapore Dollar","$"],["SLE","Sierra Leonean Leone","Le"],
  ["SOS","Somali Shilling","Sh"],["SRD","Surinamese Dollar","$"],["SSP","South Sudanese Pound","£"],
  ["STN","São Tomé and Príncipe Dobra","Db"],["SYP","Syrian Pound","£S"],["SZL","Swazi Lilangeni","E"],
  ["THB","Thai Baht","฿"],["TJS","Tajikistani Somoni","SM"],["TMT","Turkmenistan Manat","m"],
  ["TND","Tunisian Dinar","DT"],["TOP","Tongan Paʻanga","T$"],["TRY","Turkish Lira","₺"],
  ["TTD","Trinidad and Tobago Dollar","$"],["TWD","New Taiwan Dollar","NT$"],["TZS","Tanzanian Shilling","TSh"],
  ["UAH","Ukrainian Hryvnia","₴"],["UGX","Ugandan Shilling","USh"],["UYU","Uruguayan Peso","$U"],
  ["UZS","Uzbekistani Som","soʻm"],["VES","Venezuelan Bolívar Soberano","Bs.S"],["VND","Vietnamese Đồng","₫"],
  ["VUV","Vanuatu Vatu","VT"],["WST","Samoan Tālā","T"],["XAF","Central African CFA Franc","FCFA"],
  ["XCD","East Caribbean Dollar","$"],["XOF","West African CFA Franc","CFA"],["YER","Yemeni Rial","﷼"],
  ["ZAR","South African Rand","R"],["ZMW","Zambian Kwacha","ZK"],["ZWG","Zimbabwean Gold","ZiG"]
];
CC.CURRENCIES = C;
CC.CUR = {};
C.forEach(function (c) { CC.CUR[c[0]] = { name: c[1], symbol: c[2] }; });
CC.currencyLabel = function (code) {
  var c = CC.CUR[code];
  return c ? code + " (" + c.symbol + ")" : code;
};

})(window.CC);
