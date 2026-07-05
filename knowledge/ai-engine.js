// ============================================================
//  PhotoAI — Built-in Knowledge Engine
//  Works 100% offline, NO API key required
//  Adobe Photoshop Expert (PS 1.0 → 2025) + Bangla + English
// ============================================================

'use strict';

// ── Language Detection ──────────────────────────────────────
function detectLanguage(text) {
  const banglaChars = (text.match(/[\u0980-\u09FF]/g) || []).length;
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars  = text.replace(/\s/g, '').length || 1;
  if (banglaChars / totalChars > 0.15) return 'bn';
  if (arabicChars / totalChars > 0.15) return 'ar';
  return 'en';
}

// ── Intent Detection ────────────────────────────────────────
function detectIntent(text) {
  const t = text.toLowerCase();
  const isBn = detectLanguage(text) === 'bn';

  const patterns = [
    // Greetings
    { intent: 'greeting',       kw: ['hello','hi','hey','হ্যালো','নমস্কার','হাই','আসসালামু','সালাম','good morning','good evening','কেমন আছ','how are you'] },
    // PS Version History
    { intent: 'version_history',kw: ['version','history','1.0','2.0','cs','cs2','cs3','cs4','cs5','cs6','2023','2024','2025','পুরনো','পুরান','নতুন ভার্সন','কোন ভার্সন'] },
    // Background Removal
    { intent: 'bg_removal',     kw: ['background remov','remove background','bg remov','ব্যাকগ্রাউন্ড রিমুভ','background মুছ','পটভূমি','remove bg','cut out','backround'] },
    // Pen Tool
    { intent: 'pen_tool',       kw: ['pen tool','clipping path','পেন টুল','ক্লিপিং পাথ','path','bezier','anchor'] },
    // Layers
    { intent: 'layers',         kw: ['layer','লেয়ার','লেয়ার মাস্ক','adjustment layer','layer mask','blending','blend mode','opacity','স্বচ্ছতা'] },
    // Selection Tools
    { intent: 'selection',      kw: ['select','selection','magic wand','lasso','marquee','quick select','object select','সিলেক্ট','নির্বাচন','select subject'] },
    // Retouching
    { intent: 'retouching',     kw: ['retouch','skin','portrait','heal','spot heal','clone','smooth','রিটাচ','স্কিন','ত্বক','মুখ','beauty'] },
    // Ghost Mannequin
    { intent: 'ghost_mannequin',kw: ['ghost mannequin','neck joint','ঘোস্ট ম্যানেকিন','নেক জয়েন্ট','invisible mannequin','mannequin','collar'] },
    // Generative Fill / AI
    { intent: 'generative_fill',kw: ['generative fill','generative','firefly','ai fill','generate','content aware fill','content-aware','কনটেন্ট অ্যাওয়ার','জেনারেটিভ'] },
    // Color Grading
    { intent: 'color_grade',    kw: ['color grad','colour grad','color correct','colour correct','lut','curves','levels','hue','saturation','color balance','কালার গ্রেড','রঙ','রং'] },
    // Shortcuts
    { intent: 'shortcuts',      kw: ['shortcut','keyboard','hotkey','কীবোর্ড','শর্টকাট','shortkey'] },
    // Filters
    { intent: 'filters',        kw: ['filter','blur','sharpen','liquify','neural filter','smart sharpen','gaussian','motion blur','ফিল্টার','লিকুইফাই'] },
    // Smart Objects
    { intent: 'smart_objects',  kw: ['smart object','smart filter','linked','embed','স্মার্ট অবজেক্ট'] },
    // Sky Replacement
    { intent: 'sky_replace',    kw: ['sky','আকাশ','sky replacement','replace sky'] },
    // Export / Save
    { intent: 'export',         kw: ['export','save','save for web','jpeg','jpg','png','psd','pdf','tiff','raw','সেভ','এক্সপোর্ট','ফাইল সেভ'] },
    // Actions / Batch
    { intent: 'actions',        kw: ['action','batch','automate','script','droplet','অটোমেট','ব্যাচ','অ্যাকশন'] },
    // Camera Raw
    { intent: 'camera_raw',     kw: ['camera raw','raw','lightroom','acr','exposure','highlight','shadow','dehaze','ক্যামেরা র‍্যাও'] },
    // Blending Modes
    { intent: 'blend_modes',    kw: ['blending mode','multiply','screen','overlay','soft light','hard light','color dodge','ব্লেন্ড মোড','ব্লেন্ডিং'] },
    // Transform
    { intent: 'transform',      kw: ['transform','warp','puppet warp','free transform','distort','perspective','ট্রান্সফর্ম','ওয়ার্প'] },
    // Text / Typography
    { intent: 'typography',     kw: ['text','type','font','typography','character','paragraph','টেক্সট','টাইপ','ফন্ট'] },
    // General Photoshop intro
    { intent: 'what_is_ps',     kw: ['what is photoshop','photoshop কি','photoshop কী','photoshop কিভাবে','photoshop শিখ','learn photoshop','ফটোশপ কি','ফটোশপ শিখ'] },
    // Translation request
    { intent: 'translate',      kw: ['translate','অনুবাদ','বাংলায় বল','bangla','english me','ইংরেজি'] },
    // Capabilities of the bot
    { intent: 'capabilities',   kw: ['what can you','তুমি কি কর','আপনি কি জান','তুমি কি জান','can you help','help me with','আমাকে সাহায্য','কী কী পার'] },
  ];

  for (const p of patterns) {
    if (p.kw.some(k => t.includes(k))) return p.intent;
  }
  return 'general';
}

// ── Knowledge Base ──────────────────────────────────────────
const KB = {

  greeting: {
    en: () => `Hello! 👋 I'm **PhotoAI** — your Adobe Photoshop expert assistant by **SB Studio**!

I have deep knowledge of **every Photoshop version** from PS 1.0 (1990) all the way to **Photoshop 2025**.

**What can I help you with?**
- 🎨 Any Photoshop tool, technique, or feature
- 📸 Background removal, retouching, color grading
- 👕 Ghost mannequin / neck joint
- ✨ AI features (Generative Fill, Neural Filters)
- 🌍 Bangla ↔ English translation
- ❓ Any general question

*Just ask me anything!*`,

    bn: () => `হ্যালো! 👋 আমি **PhotoAI** — **SB Studio**-র Adobe Photoshop বিশেষজ্ঞ AI!

আমি **Photoshop 1.0 (1990)** থেকে **Photoshop 2025** পর্যন্ত প্রতিটি ভার্সন সম্পর্কে গভীর জ্ঞান রাখি।

**আমি কী কী সাহায্য করতে পারি?**
- 🎨 যেকোনো Photoshop টুল, টেকনিক বা ফিচার
- 📸 ব্যাকগ্রাউন্ড রিমুভ, রিটাচিং, কালার গ্রেডিং
- 👕 Ghost Mannequin / নেক জয়েন্ট
- ✨ AI ফিচার (Generative Fill, Neural Filters)
- 🌍 বাংলা ↔ ইংরেজি অনুবাদ
- ❓ যেকোনো সাধারণ প্রশ্ন

*যেকোনো প্রশ্ন করুন!*`
  },

  capabilities: {
    en: () => `I'm **PhotoAI** — here's everything I can do:

## 🎨 Adobe Photoshop Expertise
- Complete knowledge of **all versions**: PS 1.0 (1990) → PS 2025
- Every tool, filter, shortcut, blending mode
- Professional workflows: clipping path, retouching, compositing
- AI features: Generative Fill, Neural Filters, Sky Replacement

## 🌍 Languages
- Fully fluent in **Bangla (Bengali)** and **English**
- Can translate between Bangla ↔ English
- Understands Hindi, Arabic, Spanish, French, and more

## 💡 Other Capabilities
- Step-by-step tutorials and guides
- Troubleshooting Photoshop problems
- Explaining any design concept
- General knowledge questions

*Ask me anything!*`,

    bn: () => `আমি **PhotoAI** — এখানে আমি যা যা করতে পারি:

## 🎨 Adobe Photoshop বিশেষজ্ঞ
- **সব ভার্সনের** সম্পূর্ণ জ্ঞান: PS 1.0 (1990) → PS 2025
- প্রতিটি টুল, ফিল্টার, শর্টকাট, ব্লেন্ডিং মোড
- পেশাদার ওয়ার্কফ্লো: ক্লিপিং পাথ, রিটাচিং, কম্পোজিটিং
- AI ফিচার: Generative Fill, Neural Filters, Sky Replacement

## 🌍 ভাষা
- **বাংলা (বাংলাদেশ/ভারত)** এবং **ইংরেজি**-তে সম্পূর্ণ দক্ষ
- বাংলা ↔ ইংরেজি অনুবাদ করতে পারি
- হিন্দি, আরবি, স্প্যানিশ, ফরাসি ইত্যাদিও বুঝি

## 💡 অন্যান্য দক্ষতা
- ধাপে ধাপে টিউটোরিয়াল এবং গাইড
- Photoshop সমস্যা সমাধান
- যেকোনো ডিজাইন কনসেপ্ট ব্যাখ্যা
- সাধারণ জ্ঞানের প্রশ্ন

*যেকোনো প্রশ্ন করুন!*`
  },

  what_is_ps: {
    en: () => `## What is Adobe Photoshop?

**Adobe Photoshop** is the world's most powerful image editing software, developed by Adobe Inc. It was first released in **1990** and has grown into the industry standard for:

- 📸 **Photo editing & retouching**
- 🎨 **Digital art & illustration**
- 🖥️ **Graphic design & web design**
- 🎬 **Video editing & animation**
- 🏢 **Commercial photography (e-commerce, advertising)**

### Quick History
| Era | Version | Key Feature Added |
|-----|---------|------------------|
| 1990 | PS 1.0 | Basic image editing (Mac only) |
| 1994 | PS 3.0 | **Layers** — the biggest ever feature |
| 2003 | PS CS  | Camera Raw, Match Color |
| 2010 | PS CS5 | Content-Aware Fill |
| 2021 | PS 2021| Neural Filters, Sky Replacement |
| 2023 | PS 2023| Generative Fill (AI/Firefly) |
| 2025 | PS 2025| Advanced AI, Firefly Image 3 |

Photoshop is used by photographers, designers, retouchers, and artists worldwide. Ask me about any specific version or feature!`,

    bn: () => `## Adobe Photoshop কী?

**Adobe Photoshop** হলো বিশ্বের সবচেয়ে শক্তিশালী ছবি সম্পাদনা সফটওয়্যার, Adobe Inc. দ্বারা তৈরি। এটি **১৯৯০ সালে** প্রথম মুক্তি পায় এবং এটি এখন এসব কাজের শিল্প মান:

- 📸 **ফটো সম্পাদনা ও রিটাচিং**
- 🎨 **ডিজিটাল আর্ট ও চিত্রাঙ্কন**
- 🖥️ **গ্রাফিক ডিজাইন ও ওয়েব ডিজাইন**
- 🎬 **ভিডিও সম্পাদনা ও অ্যানিমেশন**
- 🏢 **কমার্শিয়াল ফটোগ্রাফি (ই-কমার্স, বিজ্ঞাপন)**

### সংক্ষিপ্ত ইতিহাস
| সময়কাল | ভার্সন | প্রধান ফিচার |
|---------|--------|-------------|
| ১৯৯০ | PS 1.0 | মৌলিক ছবি সম্পাদনা (শুধু Mac) |
| ১৯৯৪ | PS 3.0 | **Layers** — সবচেয়ে বড় ফিচার |
| ২০০৩ | PS CS  | Camera Raw |
| ২০১০ | PS CS5 | Content-Aware Fill |
| ২০২১ | PS 2021| Neural Filters, Sky Replacement |
| ২০২৩ | PS 2023| Generative Fill (AI) |
| ২০২৫ | PS 2025| উন্নত AI, Firefly Image 3 |

ফটোগ্রাফার, ডিজাইনার, রিটাচার এবং শিল্পীরা সারাবিশ্বে Photoshop ব্যবহার করেন।`
  },

  version_history: {
    en: () => `## Adobe Photoshop — Complete Version History

### 🕰️ Early Era (1990–2002)
| Version | Year | Key Additions |
|---------|------|---------------|
| **1.0** | 1990 | First release, Mac only, basic tools |
| **2.0** | 1991 | Paths, Pen Tool, CMYK, EPS support |
| **2.5** | 1992 | First Windows version! Palettes introduced |
| **3.0** | 1994 | 🌟 **LAYERS** — the biggest feature ever |
| **4.0** | 1996 | Actions, Adjustment Layers, Multiple Undo |
| **5.0** | 1998 | History palette, Magnetic Lasso, Editable text |
| **5.5** | 1999 | Save for Web, ImageReady bundled |
| **6.0** | 2000 | Vector shapes, Layer Styles, Liquify |
| **7.0** | 2002 | Healing Brush, Patch Tool, File Browser |

### 🎨 Creative Suite Era (2003–2012)
| Version | Year | Key Additions |
|---------|------|---------------|
| **CS (8)** | 2003 | Camera Raw, Match Color, Shadow/Highlight |
| **CS2 (9)**| 2005 | Smart Objects, Vanishing Point, Warp |
| **CS3 (10)**|2007 | Quick Selection, Smart Filters, Black & White |
| **CS4 (11)**|2008 | Content-Aware Scale, Masks panel, 3D |
| **CS5 (12)**|2010 | 🌟 **Content-Aware Fill**, Refine Edge, HDR Pro |
| **CS6 (13)**|2012 | Dark UI, Blur Gallery, Crop redesign |

### ☁️ Creative Cloud Era (2013–2025)
| Version | Year | Key Additions |
|---------|------|---------------|
| **CC 2013** | 2013 | Smart Sharpen, Camera Shake Reduction |
| **CC 2014** | 2014 | Focus Area, Generator, Linked Smart Objects |
| **CC 2015** | 2015 | Dehaze, Artboards |
| **CC 2017** | 2017 | 🌟 **Select Subject (AI)**, Face-Aware Liquify |
| **CC 2018** | 2018 | Curvature Pen, 360 Panoramas |
| **CC 2019** | 2019 | Content-Aware Fill workspace, Frame Tool |
| **2020** | 2020 | Object Selection, Unified Transform |
| **2021** | 2021 | 🌟 **Neural Filters**, Sky Replacement |
| **2022** | 2022 | Auto-detect subjects, improved Select & Mask |
| **2023** | 2023 | 🌟 **Generative Fill (Firefly AI)**, Remove Tool |
| **2024** | 2024 | Generative Expand, AI Background, Remove Object |
| **2025** | 2025 | 🌟 Firefly Image 3, Content Credentials, advanced AI |`,

    bn: () => `## Adobe Photoshop — সম্পূর্ণ ভার্সন ইতিহাস

### 🕰️ প্রারম্ভিক যুগ (১৯৯০–২০০২)
| ভার্সন | বছর | প্রধান ফিচার |
|--------|-----|-------------|
| **1.0** | ১৯৯০ | প্রথম রিলিজ, শুধু Mac, মৌলিক টুল |
| **2.0** | ১৯৯১ | Paths, Pen Tool, CMYK |
| **2.5** | ১৯৯২ | প্রথম Windows ভার্সন! |
| **3.0** | ১৯৯৪ | 🌟 **LAYERS** — সবচেয়ে বড় ফিচার |
| **4.0** | ১৯৯৬ | Actions, Adjustment Layers |
| **5.0** | ১৯৯৮ | History, Magnetic Lasso, Editable Text |
| **6.0** | ২০০০ | Layer Styles, Liquify |
| **7.0** | ২০০২ | Healing Brush, Patch Tool |

### 🎨 Creative Suite যুগ (২০০৩–২০১২)
| ভার্সন | বছর | প্রধান ফিচার |
|--------|-----|-------------|
| **CS (8)** | ২০০৩ | Camera Raw, Shadow/Highlight |
| **CS2 (9)**| ২০০৫ | Smart Objects, Warp |
| **CS3 (10)**|২০০৭ | Quick Selection, Smart Filters |
| **CS5 (12)**|২০১০ | 🌟 **Content-Aware Fill** |
| **CS6 (13)**|২০১২ | Dark UI, Blur Gallery |

### ☁️ Creative Cloud যুগ (২০১৩–২০২৫)
| ভার্সন | বছর | প্রধান ফিচার |
|--------|-----|-------------|
| **CC 2017** | ২০১৭ | 🌟 **AI Select Subject**, Face Liquify |
| **CC 2019** | ২০১৯ | Frame Tool, Content-Aware Fill ওয়ার্কস্পেস |
| **2021** | ২০২১ | 🌟 **Neural Filters**, Sky Replacement |
| **2023** | ২০২৩ | 🌟 **Generative Fill (Firefly AI)** |
| **2024** | ২০২৪ | Generative Expand, AI Background Removal |
| **2025** | ২০২৫ | 🌟 Firefly Image 3, Content Credentials |`
  },

  bg_removal: {
    en: () => `## Background Removal in Photoshop — All Methods

### ✅ Method 1: AI One-Click (PS 2020+)
1. Open image → Go to **Window > Properties**
2. Click **"Remove Background"** button
3. Done! *(Works best with clear subjects)*

### ✅ Method 2: Select Subject + Refine Edge (PS 2020+)
1. **Select > Subject** (Ctrl+Alt+Shift+S shortcut not direct — use menu)
2. Click **"Select and Mask"** in options bar
3. Use **Refine Edge Brush** on hair/fur edges
4. Output to: **Layer Mask** → Click OK
5. Delete or hide background layer

### ✅ Method 3: Pen Tool / Clipping Path (Best for e-commerce)
1. Select **Pen Tool (P)**
2. Click around subject edges to create path
3. Close the path (click starting point)
4. Right-click → **Make Selection** (Feather: 0px)
5. **Ctrl+Shift+I** to invert selection
6. **Delete** → background removed
7. *(This gives the sharpest, cleanest result)*

### ✅ Method 4: Magic Wand / Quick Selection
1. Select **Quick Selection Tool (W)**
2. Paint over the subject
3. Hold **Alt** to deselect areas
4. Refine with **Select and Mask**
5. Add Layer Mask

### ✅ Method 5: Color Range (for solid backgrounds)
1. **Select > Color Range**
2. Click on background color
3. Adjust **Fuzziness** slider
4. Click OK → Delete

> **Pro Tip:** For e-commerce / clipping path work, always use the **Pen Tool** method for pixel-perfect edges!`,

    bn: () => `## Photoshop-এ ব্যাকগ্রাউন্ড রিমুভ — সব পদ্ধতি

### ✅ পদ্ধতি ১: AI এক-ক্লিক (PS 2020+)
1. ছবি খুলুন → **Window > Properties**-এ যান
2. **"Remove Background"** বাটনে ক্লিক করুন
3. শেষ! *(স্পষ্ট সাবজেক্টের জন্য সেরা)*

### ✅ পদ্ধতি ২: Select Subject + Refine Edge (PS 2020+)
1. **Select > Subject** মেনু থেকে
2. অপশন বারে **"Select and Mask"** ক্লিক করুন
3. চুল/পশমের কিনারায় **Refine Edge Brush** ব্যবহার করুন
4. Output: **Layer Mask** → OK ক্লিক করুন
5. ব্যাকগ্রাউন্ড লেয়ার মুছুন বা লুকান

### ✅ পদ্ধতি ৩: Pen Tool / Clipping Path (ই-কমার্সের জন্য সেরা)
1. **Pen Tool (P)** সিলেক্ট করুন
2. সাবজেক্টের কিনারায় ক্লিক করে পাথ তৈরি করুন
3. পাথ বন্ধ করুন (শুরুর পয়েন্টে ক্লিক)
4. রাইট-ক্লিক → **Make Selection** (Feather: 0px)
5. **Ctrl+Shift+I** দিয়ে সিলেকশন উল্টান
6. **Delete** চাপুন → ব্যাকগ্রাউন্ড চলে যাবে
7. *(সবচেয়ে তীক্ষ্ণ, পরিষ্কার ফলাফল দেয়)*

### ✅ পদ্ধতি ৪: Quick Selection
1. **Quick Selection Tool (W)** সিলেক্ট করুন
2. সাবজেক্টের উপর পেইন্ট করুন
3. **Alt** ধরে অতিরিক্ত এলাকা বাদ দিন
4. **Select and Mask** দিয়ে পরিশোধন করুন
5. Layer Mask যোগ করুন

> **প্রো টিপ:** ই-কমার্স / ক্লিপিং পাথের কাজে সবসময় **Pen Tool** পদ্ধতি ব্যবহার করুন!`
  },

  pen_tool: {
    en: () => `## Photoshop Pen Tool — Complete Guide

The **Pen Tool (P)** is the most precise selection and masking tool in Photoshop, used for professional **clipping paths**.

### 🎯 Basic Usage
1. Press **P** to select Pen Tool
2. **Click** to create straight lines (corner anchor)
3. **Click + Drag** to create curves (smooth anchor)
4. **Alt + Click** anchor to convert smooth → corner
5. **Ctrl + Click** to move an anchor point
6. Click the **first anchor** to close the path

### 📐 Creating a Clipping Path (E-commerce Standard)
\`\`\`
1. Zoom in to 100-200% for precision (Ctrl + Plus)
2. Select Pen Tool (P)
3. Click around the product edges
4. For curves: click + drag to adjust handle direction
5. Close path by clicking starting point
6. Right-click → Make Selection (Feather: 0)
7. OR: Go to Paths panel → Right-click path → Clipping Path
\`\`\`

### 🔑 Key Shortcuts
| Shortcut | Action |
|----------|--------|
| P | Select Pen Tool |
| A | Direct Selection (move anchors) |
| Ctrl+Click | Temporarily switch to Direct Selection |
| Alt+Click | Convert anchor type |
| Ctrl+Enter | Convert path to selection |
| Ctrl+Shift+H | Show/hide path |

### 💡 Pro Tips
- **Zoom in** close to the edge for best accuracy
- Use **as few anchor points as possible** for smooth curves
- Hold **Shift** while clicking to add to path straight at 45°/90°
- The Pen Tool was added in **Photoshop 2.0 (1991)**`,

    bn: () => `## Photoshop Pen Tool — সম্পূর্ণ গাইড

**Pen Tool (P)** হলো Photoshop-এর সবচেয়ে নির্ভুল সিলেকশন টুল, পেশাদার **ক্লিপিং পাথের** জন্য ব্যবহৃত।

### 🎯 মৌলিক ব্যবহার
1. **P** চাপুন Pen Tool সিলেক্ট করতে
2. সরল রেখার জন্য **ক্লিক** করুন (corner anchor)
3. বাঁক তৈরিতে **ক্লিক + ড্র্যাগ** করুন (smooth anchor)
4. **Alt + ক্লিক** দিয়ে smooth → corner-এ রূপান্তর করুন
5. **Ctrl + ক্লিক** দিয়ে anchor point সরান
6. **প্রথম anchor**-এ ক্লিক করে পাথ বন্ধ করুন

### 📐 ক্লিপিং পাথ তৈরি (ই-কমার্স স্ট্যান্ডার্ড)
\`\`\`
১. নির্ভুলতার জন্য ১০০-২০০% জুম করুন (Ctrl + Plus)
২. Pen Tool (P) সিলেক্ট করুন
৩. পণ্যের কিনারায় ক্লিক করুন
৪. বাঁকের জন্য: ক্লিক + ড্র্যাগ করুন
৫. শুরুর পয়েন্টে ক্লিক করে পাথ বন্ধ করুন
৬. রাইট-ক্লিক → Make Selection (Feather: 0)
৭. অথবা: Paths panel → রাইট-ক্লিক → Clipping Path
\`\`\`

### 🔑 প্রধান শর্টকাট
| শর্টকাট | কাজ |
|---------|-----|
| P | Pen Tool সিলেক্ট |
| A | Direct Selection (anchor সরান) |
| Ctrl+Enter | পাথ → সিলেকশনে রূপান্তর |
| Alt+Click | Anchor ধরন পরিবর্তন |

### 💡 প্রো টিপস
- নির্ভুলতার জন্য **কাছে জুম করুন**
- মসৃণ বাঁকের জন্য **কম anchor point** ব্যবহার করুন`
  },

  ghost_mannequin: {
    en: () => `## Ghost Mannequin / Neck Joint Effect — Step by Step

The **Ghost Mannequin** (Invisible Mannequin) technique removes the mannequin from clothing product photos, giving a 3D hollow look.

### 📸 Required Photos
You need **2 photos** of the same garment:
1. **Front shot** — product on mannequin
2. **Inside shot** — product inside/collar facing camera (neck label visible)

### 🔧 Step-by-Step Process

**Step 1 — Remove Mannequin from Front Shot**
1. Open front photo in Photoshop
2. Use **Pen Tool** to select the garment (careful around collar)
3. Right-click → Make Selection → Inverse → Delete background
4. Also cut out the mannequin from inside the collar area

**Step 2 — Prepare Inside/Collar Shot**
1. Open inside photo as a new layer
2. Remove background with Pen Tool or Select Subject
3. Position to show only the collar/neck label area

**Step 3 — Combine Both Layers**
\`\`\`
1. Place inside-collar image BELOW front image
2. Align them perfectly (use Free Transform: Ctrl+T)
3. Add Layer Mask to front layer
4. Paint BLACK on mask to reveal collar from inside layer
5. Fine-tune edges with a soft brush
\`\`\`

**Step 4 — Final Polish**
- Match colors between both layers (Image > Adjustments > Match Color)
- Clean edges with Clone Stamp or Healing Brush
- Flatten → Save as PSD + export JPEG/PNG

### 💡 Pro Tips
- Shoot both photos without moving the camera (tripod!)
- Use **same lighting** for both shots
- Common in fashion e-commerce (Bangladesh garment industry widely uses this)`,

    bn: () => `## Ghost Mannequin / নেক জয়েন্ট ইফেক্ট — ধাপে ধাপে

**Ghost Mannequin** (অদৃশ্য ম্যানেকিন) কৌশল পোশাকের ফটো থেকে ম্যানেকিন সরিয়ে ৩D ফাঁকা চেহারা দেয়।

### 📸 প্রয়োজনীয় ছবি
একই পোশাকের **২টি ছবি** লাগবে:
1. **সামনের শট** — ম্যানেকিনে পোশাক
2. **ভেতরের শট** — পোশাকের ভেতর/কলার ক্যামেরার দিকে (নেক লেবেল দৃশ্যমান)

### 🔧 ধাপে ধাপে প্রক্রিয়া

**ধাপ ১ — সামনের শট থেকে ম্যানেকিন সরান**
1. সামনের ছবি Photoshop-এ খুলুন
2. **Pen Tool** দিয়ে পোশাক সিলেক্ট করুন (কলারের কাছে সতর্ক থাকুন)
3. রাইট-ক্লিক → Make Selection → Inverse → Delete
4. কলারের ভেতর থেকেও ম্যানেকিন কেটে বের করুন

**ধাপ ২ — ভেতরের/কলারের শট প্রস্তুত করুন**
1. ভেতরের ছবি নতুন লেয়ার হিসেবে খুলুন
2. Pen Tool দিয়ে ব্যাকগ্রাউন্ড সরান
3. শুধু কলার/নেক লেবেল এলাকা দেখান

**ধাপ ৩ — দুটি লেয়ার একত্রিত করুন**
\`\`\`
১. ভেতরের-কলার ছবি সামনের ছবির নিচে রাখুন
২. Free Transform (Ctrl+T) দিয়ে নিখুঁতভাবে মিলিয়ে নিন
৩. সামনের লেয়ারে Layer Mask যোগ করুন
৪. Mask-এ কালো রং পেইন্ট করুন নিচের কলার দেখাতে
৫. নরম ব্রাশ দিয়ে কিনারা সূক্ষ্ম করুন
\`\`\`

**ধাপ ৪ — চূড়ান্ত পোলিশ**
- উভয় লেয়ারের রং মেলান (Image > Adjustments > Match Color)
- Clone Stamp বা Healing Brush দিয়ে কিনারা পরিষ্কার করুন
- Flatten → PSD সেভ + JPEG/PNG এক্সপোর্ট করুন

### 💡 প্রো টিপস
- উভয় ছবি ক্যামেরা না সরিয়ে তুলুন (ট্রাইপড ব্যবহার করুন!)
- উভয় শটে **একই আলো** ব্যবহার করুন
- বাংলাদেশের গার্মেন্ট ইন্ডাস্ট্রিতে এটি ব্যাপকভাবে ব্যবহৃত হয়`
  },

  generative_fill: {
    en: () => `## Generative Fill — Photoshop 2023/2024/2025 AI Feature

**Generative Fill** uses Adobe Firefly AI to add, remove, or replace content in your images using text prompts.

### 🚀 How to Use Generative Fill

**Method 1 — Add New Content**
\`\`\`
1. Open image in Photoshop 2023 or later
2. Make a selection (any selection tool)
3. Click "Generative Fill" in the contextual taskbar
4. Type a text prompt (e.g., "sunset sky", "modern sofa")
5. Click "Generate" → AI creates 3 variations
6. Choose your favorite!
\`\`\`

**Method 2 — Remove Objects (Distraction-free)**
\`\`\`
1. Select the unwanted object
2. Click "Generative Fill"
3. Leave prompt EMPTY
4. Click Generate → AI fills with matching background
\`\`\`

**Method 3 — Generative Expand (PS 2024+)**
\`\`\`
1. Use Crop Tool → extend canvas beyond image
2. Contextual taskbar shows "Generative Expand"
3. Type prompt or leave empty
4. AI fills the new canvas area intelligently
\`\`\`

### 💡 Best Prompts for Fashion/Product
- *"white studio background"* — clean product bg
- *"outdoor lifestyle background"* — natural feel
- *"wooden table surface"* — product placement
- *"remove wrinkles"* — clothing smoothing

### ⚠️ Requirements
- Photoshop **2023 or later** (version 24.5+)
- Adobe Creative Cloud subscription
- Internet connection (cloud-based AI)
- Works best on: **Windows 10/11, macOS 12+**`,

    bn: () => `## Generative Fill — Photoshop 2023/2024/2025 AI ফিচার

**Generative Fill** Adobe Firefly AI ব্যবহার করে টেক্সট প্রম্পট দিয়ে ছবিতে বিষয়বস্তু যোগ, সরান বা প্রতিস্থাপন করে।

### 🚀 Generative Fill কিভাবে ব্যবহার করবেন

**পদ্ধতি ১ — নতুন কন্টেন্ট যোগ**
\`\`\`
১. Photoshop 2023 বা পরে ছবি খুলুন
২. যেকোনো সিলেকশন টুল দিয়ে এলাকা সিলেক্ট করুন
৩. contextual taskbar-এ "Generative Fill" ক্লিক করুন
৪. টেক্সট প্রম্পট লিখুন (যেমন: "সূর্যাস্তের আকাশ", "আধুনিক সোফা")
৫. "Generate" ক্লিক করুন → AI ৩টি ভেরিয়েশন তৈরি করে
৬. পছন্দের টি বেছে নিন!
\`\`\`

**পদ্ধতি ২ — অবাঞ্ছিত বস্তু সরান**
\`\`\`
১. অবাঞ্ছিত বস্তু সিলেক্ট করুন
২. "Generative Fill" ক্লিক করুন
৩. প্রম্পট বক্স খালি রাখুন
৪. Generate ক্লিক করুন → AI মিলিয়ে ব্যাকগ্রাউন্ড পূরণ করে
\`\`\`

**পদ্ধতি ৩ — Generative Expand (PS 2024+)**
\`\`\`
১. Crop Tool দিয়ে ছবির বাইরে canvas প্রসারিত করুন
২. Taskbar-এ "Generative Expand" দেখাবে
৩. প্রম্পট লিখুন বা খালি রাখুন
৪. AI বুদ্ধিমত্তার সাথে নতুন canvas এলাকা পূরণ করে
\`\`\`

### ⚠️ প্রয়োজনীয়তা
- Photoshop **2023 বা পরে** (ভার্সন 24.5+)
- Adobe Creative Cloud সাবস্ক্রিপশন
- ইন্টারনেট সংযোগ (cloud-based AI)
- সেরা কাজ করে: **Windows 10/11, macOS 12+**`
  },

  layers: {
    en: () => `## Photoshop Layers — Complete Guide

**Layers** were introduced in **Photoshop 3.0 (1994)** and are the most fundamental feature.

### 🗂️ Types of Layers
| Layer Type | Description |
|-----------|-------------|
| **Pixel Layer** | Regular image layer (photos, paint) |
| **Adjustment Layer** | Non-destructive color/tone edits |
| **Fill Layer** | Solid color, gradient, or pattern fills |
| **Smart Object** | Non-destructive, editable embedded content |
| **Text Layer** | Editable vector text |
| **Shape Layer** | Vector shapes |
| **3D Layer** | 3D objects (CS4+) |
| **Video Layer** | Video frames (CS3+) |

### 🎭 The 27 Blending Modes (Categories)
**Normal:** Normal, Dissolve  
**Darken:** Darken, Multiply, Color Burn, Linear Burn, Darker Color  
**Lighten:** Lighten, Screen, Color Dodge, Linear Dodge, Lighter Color  
**Contrast:** Overlay, Soft Light, Hard Light, Vivid Light, Linear Light, Pin Light, Hard Mix  
**Inversion:** Difference, Exclusion, Subtract, Divide  
**Component:** Hue, Saturation, Color, Luminosity  

### 🔑 Essential Layer Shortcuts
| Shortcut | Action |
|----------|--------|
| Ctrl+Shift+N | New Layer |
| Ctrl+J | Duplicate Layer |
| Ctrl+E | Merge Down |
| Ctrl+Shift+E | Merge Visible |
| Ctrl+Alt+Shift+E | Stamp Visible (merge copy) |
| Alt+Click layer icon | Solo view layer |
| Ctrl+G | Group layers |
| Ctrl+Shift+G | Ungroup |

### 💡 Pro Layer Tips
- **Always work non-destructively** → use Adjustment Layers
- **Ctrl+Click** layer thumbnail = load selection
- **Alt+Click** between layers = Clipping Mask
- Double-click layer name to rename`,

    bn: () => `## Photoshop Layers — সম্পূর্ণ গাইড

**Layers** **Photoshop 3.0 (1994)**-এ প্রথম এসেছে এবং এটি সবচেয়ে মৌলিক ফিচার।

### 🗂️ লেয়ারের প্রকারভেদ
| লেয়ারের ধরন | বিবরণ |
|------------|-------|
| **Pixel Layer** | সাধারণ ছবি লেয়ার |
| **Adjustment Layer** | Non-destructive রঙ/টোন সম্পাদনা |
| **Smart Object** | Non-destructive embedded কন্টেন্ট |
| **Text Layer** | সম্পাদনযোগ্য ভেক্টর টেক্সট |
| **Shape Layer** | ভেক্টর আকার |

### 🎭 ২৭টি Blending Mode
**Normal:** Normal, Dissolve  
**গাঢ় করে:** Darken, Multiply, Color Burn, Linear Burn  
**উজ্জ্বল করে:** Lighten, Screen, Color Dodge, Linear Dodge  
**কনট্রাস্ট:** Overlay, Soft Light, Hard Light, Vivid Light  
**বিপরীত:** Difference, Exclusion  
**রং:** Hue, Saturation, Color, Luminosity  

### 🔑 প্রধান লেয়ার শর্টকাট
| শর্টকাট | কাজ |
|---------|-----|
| Ctrl+Shift+N | নতুন লেয়ার |
| Ctrl+J | লেয়ার ডুপ্লিকেট |
| Ctrl+E | নিচের লেয়ারের সাথে মার্জ |
| Ctrl+G | লেয়ার গ্রুপ করুন |
| Ctrl+Alt+Shift+E | Stamp Visible (মার্জ কপি) |

### 💡 প্রো টিপস
- সবসময় **Adjustment Layers** ব্যবহার করুন (non-destructive)
- **Ctrl+Click** লেয়ার থাম্বনেইল = সিলেকশন লোড
- **Alt+Click** দুই লেয়ারের মাঝে = Clipping Mask`
  },

  shortcuts: {
    en: () => `## Photoshop Keyboard Shortcuts — Essential List

### 🖼️ File
| Shortcut | Action |
|----------|--------|
| Ctrl+N | New document |
| Ctrl+O | Open file |
| Ctrl+S | Save |
| Ctrl+Shift+S | Save As |
| Ctrl+Alt+Shift+S | Save for Web |
| Ctrl+W | Close document |

### ✂️ Edit
| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Undo (one step) |
| Ctrl+Alt+Z | Undo multiple steps |
| Ctrl+Shift+Z | Redo |
| Ctrl+C | Copy |
| Ctrl+X | Cut |
| Ctrl+V | Paste |
| Ctrl+T | Free Transform |
| Ctrl+F | Repeat last filter |

### 🎨 Tools
| Shortcut | Tool |
|----------|------|
| V | Move Tool |
| M | Marquee (rectangle) |
| L | Lasso Tool |
| W | Quick Selection / Magic Wand |
| P | Pen Tool |
| B | Brush Tool |
| E | Eraser |
| G | Gradient / Paint Bucket |
| T | Type Tool |
| C | Crop Tool |
| I | Eyedropper |
| J | Healing Brush / Spot Healing |
| S | Clone Stamp |
| Z | Zoom |

### 🗂️ Layers
| Shortcut | Action |
|----------|--------|
| Ctrl+Shift+N | New Layer |
| Ctrl+J | Duplicate Layer |
| Ctrl+E | Merge Down |
| Ctrl+Shift+[ | Move layer down |
| Ctrl+Shift+] | Move layer up |
| Ctrl+[ | Move layer down one |
| Ctrl+] | Move layer up one |

### 🔍 View
| Shortcut | Action |
|----------|--------|
| Ctrl+Plus | Zoom in |
| Ctrl+Minus | Zoom out |
| Ctrl+0 | Fit on screen |
| Ctrl+1 | 100% view |
| Tab | Hide/show all panels |
| F | Cycle screen modes |`,

    bn: () => `## Photoshop কীবোর্ড শর্টকাট — প্রয়োজনীয় তালিকা

### 🖼️ ফাইল
| শর্টকাট | কাজ |
|---------|-----|
| Ctrl+N | নতুন ডকুমেন্ট |
| Ctrl+O | ফাইল খুলুন |
| Ctrl+S | সেভ করুন |
| Ctrl+Shift+S | Save As |
| Ctrl+Alt+Shift+S | ওয়েবের জন্য সেভ |

### ✂️ এডিট
| শর্টকাট | কাজ |
|---------|-----|
| Ctrl+Z | Undo |
| Ctrl+Alt+Z | একাধিক Undo |
| Ctrl+T | Free Transform |
| Ctrl+C | কপি |
| Ctrl+V | পেস্ট |

### 🎨 টুলস
| শর্টকাট | টুল |
|---------|-----|
| V | Move Tool |
| P | Pen Tool |
| B | Brush Tool |
| T | Type Tool |
| C | Crop Tool |
| W | Quick Selection |
| J | Healing Brush |
| E | Eraser |
| Z | Zoom |

### 🗂️ লেয়ার
| শর্টকাট | কাজ |
|---------|-----|
| Ctrl+Shift+N | নতুন লেয়ার |
| Ctrl+J | লেয়ার ডুপ্লিকেট |
| Ctrl+E | নিচে মার্জ করুন |
| Ctrl+G | গ্রুপ করুন |`
  },

  retouching: {
    en: () => `## Professional Photo Retouching in Photoshop

### 🎨 Skin Retouching — Frequency Separation (Best Method)

**Frequency Separation** separates skin texture from color/tone.

\`\`\`
Step 1: Duplicate layer twice (Ctrl+J twice)
  - Bottom = Low Frequency (color/tone)
  - Top = High Frequency (texture/detail)

Step 2: Blur the bottom layer
  - Select bottom layer
  - Filter > Blur > Gaussian Blur (3-5px for portraits)

Step 3: Process the top layer
  - Select top layer
  - Image > Apply Image:
    - Layer: Bottom (blurred) layer
    - Blending: Subtract
    - Scale: 2, Offset: 128
  - Change blend mode to: Linear Light

Step 4: Retouch separately
  - On LOW layer: fix color with Healing Brush (no texture damage)
  - On HIGH layer: fix texture with Clone Stamp
\`\`\`

### 🌸 Quick Skin Smoothing
1. Duplicate layer → Filter > Blur > Surface Blur (Radius: 15, Threshold: 15)
2. Add Layer Mask → fill BLACK
3. Paint WHITE on skin areas only (avoid eyes, lips, hair)
4. Reduce opacity to 60-70%

### 👁️ Eye Enhancement
- **Dodge Tool** (O) → Highlights → Lighten iris and whites
- **Burn Tool** (O) → Midtones → Darken pupils for depth
- Use **Hue/Saturation** adjustment clipped to eye layer for color

### 💅 Common Retouching Tools
| Tool | Use Case |
|------|----------|
| Spot Healing Brush (J) | Quick blemish removal |
| Healing Brush (J) | Sample-based healing |
| Clone Stamp (S) | Copy/paste texture |
| Patch Tool (J) | Drag-to-heal areas |
| Content-Aware Fill | Remove large distractions |
| Dodge Tool (O) | Brighten specific areas |
| Burn Tool (O) | Darken specific areas |
| Liquify (Shift+Ctrl+X) | Reshape facial features |`,

    bn: () => `## Photoshop-এ পেশাদার ফটো রিটাচিং

### 🎨 স্কিন রিটাচিং — Frequency Separation (সেরা পদ্ধতি)

**Frequency Separation** স্কিনের টেক্সচার থেকে রঙ/টোন আলাদা করে।

\`\`\`
ধাপ ১: লেয়ার দুবার ডুপ্লিকেট করুন (Ctrl+J দুবার)
  - নিচে = Low Frequency (রঙ/টোন)
  - উপরে = High Frequency (টেক্সচার/বিস্তারিত)

ধাপ ২: নিচের লেয়ার blur করুন
  - নিচের লেয়ার সিলেক্ট করুন
  - Filter > Blur > Gaussian Blur (পোর্ট্রেটে ৩-৫px)

ধাপ ৩: উপরের লেয়ার প্রক্রিয়া করুন
  - উপরের লেয়ার সিলেক্ট করুন
  - Image > Apply Image:
    - Layer: নিচের লেয়ার
    - Blending: Subtract
    - Scale: 2, Offset: 128
  - Blend mode: Linear Light-এ পরিবর্তন করুন

ধাপ ৪: আলাদাভাবে রিটাচ করুন
  - LOW লেয়ারে: Healing Brush দিয়ে রঙ ঠিক করুন
  - HIGH লেয়ারে: Clone Stamp দিয়ে টেক্সচার ঠিক করুন
\`\`\`

### 🌸 দ্রুত স্কিন স্মুদিং
1. লেয়ার ডুপ্লিকেট → Filter > Blur > Surface Blur (Radius: 15)
2. Layer Mask যোগ → কালো দিয়ে পূরণ
3. শুধু ত্বকের এলাকায় সাদা রং পেইন্ট করুন
4. Opacity ৬০-৭০%-এ কমান

### 💅 সাধারণ রিটাচিং টুল
| টুল | ব্যবহার |
|-----|---------|
| Spot Healing Brush (J) | দ্রুত দাগ দূর করা |
| Clone Stamp (S) | টেক্সচার কপি করা |
| Patch Tool (J) | এলাকা টেনে ঠিক করা |
| Dodge Tool (O) | নির্দিষ্ট এলাকা উজ্জ্বল করা |
| Burn Tool (O) | নির্দিষ্ট এলাকা গাঢ় করা |
| Liquify (Ctrl+Shift+X) | মুখের আকৃতি পরিবর্তন |`
  },

  color_grade: {
    en: () => `## Color Grading in Photoshop — Professional Techniques

### 🎨 Essential Color Grading Tools

**1. Curves (Ctrl+M)** — Most powerful
- S-Curve = adds contrast naturally
- Lift shadows (drag bottom-left up) = faded/matte look
- Individual RGB channels for color casting

**2. Levels (Ctrl+L)**
- Input Levels: clip whites and blacks
- Output Levels: limit tonal range for faded look

**3. Hue/Saturation (Ctrl+U)**
- Adjust specific color ranges
- Shift skin tones without affecting sky

**4. Color Balance** — Shadows/Midtones/Highlights
- Cinematic: cool shadows + warm highlights

**5. Selective Color** — Target specific colors
- Perfect for product color correction

### 🎬 Popular Cinematic Looks

**Orange & Teal (Hollywood standard)**
\`\`\`
1. Add Curves adjustment layer
2. Blue channel: lift shadows (add blue/teal in darks)
3. Red channel: boost highlights (add orange in lights)
4. Green channel: slight lift in shadows
\`\`\`

**Matte/Faded Look**
\`\`\`
1. Curves → Output: raise the black point to ~30
2. Slightly desaturate with Hue/Saturation
3. Add slight blue/purple in shadows
\`\`\`

**Warm Golden Hour**
\`\`\`
1. Photo Filter → Warming Filter (85) at 30%
2. Curves → boost reds/yellows in highlights
3. Selective Color → Yellows: more yellow + red
\`\`\`

### 💡 Pro Tips
- Use **Adjustment Layers** (always non-destructive)
- Use **Clipping Masks** to affect only one layer
- Group all color grading layers in one group
- **Camera Raw Filter** (Ctrl+Shift+A) = best all-in-one tool`,

    bn: () => `## Photoshop-এ কালার গ্রেডিং — পেশাদার কৌশল

### 🎨 প্রয়োজনীয় কালার গ্রেডিং টুল

**১. Curves (Ctrl+M)** — সবচেয়ে শক্তিশালী
- S-Curve = প্রাকৃতিকভাবে কনট্রাস্ট যোগ
- Shadows উঠানো = faded/matte লুক
- RGB চ্যানেল আলাদা করে রঙের কাস্ট দেওয়া

**২. Levels (Ctrl+L)**
- Input: সাদা ও কালো ক্লিপ করুন
- Output: tonal range সীমিত করুন

**৩. Hue/Saturation (Ctrl+U)**
- নির্দিষ্ট রঙের পরিসীমা সামঞ্জস্য করুন
- আকাশ না পরিবর্তন করে ত্বকের টোন শিফট করুন

**৪. Color Balance** — Shadows/Midtones/Highlights
- সিনেমাটিক: ঠান্ডা shadows + উষ্ণ highlights

### 🎬 জনপ্রিয় সিনেমাটিক লুক

**Orange & Teal (হলিউড স্ট্যান্ডার্ড)**
\`\`\`
১. Curves adjustment layer যোগ করুন
২. Blue চ্যানেল: shadows-এ lift (darks-এ teal)
৩. Red চ্যানেল: highlights-এ boost (lights-এ orange)
৪. Green চ্যানেল: shadows-এ সামান্য lift
\`\`\`

**Matte/Faded লুক**
\`\`\`
১. Curves → Output: কালো পয়েন্ট ~৩০-এ উঠান
২. Hue/Saturation দিয়ে সামান্য desaturate করুন
৩. Shadows-এ সামান্য নীল/বেগুনি যোগ করুন
\`\`\`

### 💡 প্রো টিপস
- সবসময় **Adjustment Layers** ব্যবহার করুন (non-destructive)
- সেরা অল-ইন-ওয়ান টুল: **Camera Raw Filter** (Ctrl+Shift+A)`
  },

  filters: {
    en: () => `## Photoshop Filters — Complete Overview

### 🔵 Blur Filters
| Filter | Use |
|--------|-----|
| Gaussian Blur | General blurring |
| Motion Blur | Directional motion effect |
| Radial Blur | Spin or zoom blur |
| Field Blur | Selective focus areas |
| Tilt-Shift | Miniature effect |
| Surface Blur | Skin smoothing (preserves edges) |
| Smart Blur | Artistic softening |
| Average Blur | Reduce noise |

### 🔴 Sharpen Filters
- **Smart Sharpen** — Best overall sharpener (Remove: Lens Blur/Motion Blur)
- **Unsharp Mask** — Classic: Amount 150%, Radius 1.2, Threshold 3
- **High Pass** — Layer method: run on copy, set to Overlay mode

### 🌊 Distort Filters
- Liquify (Shift+Ctrl+X) — Push, pull, bloat faces/objects
- Warp — Apply pre-set warp shapes
- Spherize — Wrap onto sphere
- Polar Coordinates — Circular manipulations

### 🧠 Neural Filters (PS 2021+)
| Filter | What it does |
|--------|-------------|
| Skin Smoothing | AI skin retouching |
| Smart Portrait | Change expression, age, gaze |
| Style Transfer | Apply art styles to photos |
| Colorize | Auto-colorize B&W photos |
| Photo Restoration | Restore old damaged photos |
| Depth Blur | AI background blur |
| Landscape Mixer | Change seasons/landscapes |

### ⚡ Camera Raw Filter (Ctrl+Shift+A)
Available since CS6 — works like Lightroom inside Photoshop:
- Basic: Exposure, Contrast, Highlights, Shadows, Whites, Blacks
- Tone Curve, HSL, Color Grading, Detail, Lens Corrections, Transform

### 🛡️ Smart Filters (use with Smart Objects!)
- Convert layer to Smart Object first (right-click → Convert to Smart Object)
- Apply ANY filter → it becomes a Smart Filter (editable, maskable)`,

    bn: () => `## Photoshop ফিল্টার — সম্পূর্ণ পর্যালোচনা

### 🔵 Blur ফিল্টার
| ফিল্টার | ব্যবহার |
|---------|---------|
| Gaussian Blur | সাধারণ blurring |
| Motion Blur | গতির প্রভাব |
| Surface Blur | স্কিন স্মুদিং (edge সংরক্ষণ) |
| Field Blur | নির্বাচনী ফোকাস |
| Tilt-Shift | মিনিয়েচার ইফেক্ট |

### 🔴 Sharpen ফিল্টার
- **Smart Sharpen** — সেরা শার্পেনার
- **Unsharp Mask** — ক্লাসিক: Amount 150%, Radius 1.2
- **High Pass** — লেয়ার পদ্ধতি: Overlay মোডে সেট করুন

### 🧠 Neural ফিল্টার (PS 2021+)
| ফিল্টার | কী করে |
|---------|---------|
| Skin Smoothing | AI স্কিন রিটাচিং |
| Smart Portrait | এক্সপ্রেশন, বয়স পরিবর্তন |
| Colorize | B&W ছবিতে স্বয়ংক্রিয় রঙ |
| Photo Restoration | পুরনো ক্ষতিগ্রস্ত ছবি পুনরুদ্ধার |
| Depth Blur | AI ব্যাকগ্রাউন্ড blur |

### ⚡ Camera Raw ফিল্টার (Ctrl+Shift+A)
CS6 থেকে পাওয়া যায় — Photoshop-এর ভেতরে Lightroom-এর মতো কাজ:
- Exposure, Contrast, Highlights, Shadows, Whites, Blacks
- Tone Curve, HSL, Color Grading, Detail, Lens Corrections

### 🛡️ Smart ফিল্টার
- প্রথমে লেয়ারকে Smart Object-এ রূপান্তর করুন
- যেকোনো ফিল্টার প্রয়োগ করুন → Smart Filter হয়ে যায় (সম্পাদনযোগ্য)`
  },

  export: {
    en: () => `## Photoshop — Saving & Exporting Files

### 💾 Save Formats Guide
| Format | Best For | Notes |
|--------|----------|-------|
| **PSD** | Master working file | Keeps all layers |
| **PSB** | Large files >2GB | Same as PSD |
| **JPEG** | Web, photos, e-commerce | Lossy compression |
| **PNG** | Transparent backgrounds | Lossless |
| **PNG-8** | Web graphics, logos | Limited colors |
| **TIFF** | Print, professional | Lossless, large size |
| **PDF** | Print, presentations | Vector text preserved |
| **WebP** | Modern web (PS 2023+) | Small file, great quality |
| **RAW** | Camera originals | Unprocessed sensor data |

### 📤 Export Methods

**1. Export As (Recommended — PS CC 2015+)**
- File > Export > Export As
- Choose format, quality, size
- Can export multiple sizes at once

**2. Save for Web (Legacy)**
- Ctrl+Alt+Shift+S
- Best for: JPEG sliders, GIF, PNG-8
- Preview file size before saving

**3. Quick Export as PNG**
- File > Export > Quick Export as PNG
- Instant PNG with transparency

### 🖨️ Print Settings
- Mode: **CMYK** (for printing)
- Resolution: **300 DPI** minimum
- Color Profile: **Adobe RGB (1998)** or **sRGB IEC61966-2.1**

### 💡 E-commerce Standards
- Background: **Pure white (255,255,255)**
- Format: **JPEG** (Quality 80-90%)
- Size: typically **1000x1000px** or **2000x2000px**
- Color mode: **sRGB** (not CMYK for web)`,

    bn: () => `## Photoshop — ফাইল সেভ ও এক্সপোর্ট

### 💾 ফরম্যাট গাইড
| ফরম্যাট | সেরা ব্যবহার | নোট |
|---------|------------|-----|
| **PSD** | মাস্টার ওয়ার্কিং ফাইল | সব লেয়ার রাখে |
| **JPEG** | ওয়েব, ফটো, ই-কমার্স | lossy compression |
| **PNG** | স্বচ্ছ ব্যাকগ্রাউন্ড | lossless |
| **TIFF** | প্রিন্ট, পেশাদার | lossless, বড় আকার |
| **PDF** | প্রিন্ট, উপস্থাপনা | ভেক্টর টেক্সট সংরক্ষিত |
| **WebP** | আধুনিক ওয়েব (PS 2023+) | ছোট ফাইল, ভালো মান |

### 📤 এক্সপোর্ট পদ্ধতি

**১. Export As (সুপারিশকৃত)**
- File > Export > Export As
- ফরম্যাট, মান, আকার বেছে নিন

**২. Save for Web (পুরনো পদ্ধতি)**
- Ctrl+Alt+Shift+S
- সেভের আগে ফাইল সাইজ প্রিভিউ

### 🖨️ প্রিন্ট সেটিংস
- মোড: **CMYK** (প্রিন্টের জন্য)
- রেজোলিউশন: **৩০০ DPI** ন্যূনতম

### 💡 ই-কমার্স স্ট্যান্ডার্ড
- ব্যাকগ্রাউন্ড: **বিশুদ্ধ সাদা (255,255,255)**
- ফরম্যাট: **JPEG** (মান ৮০-৯০%)
- আকার: সাধারণত **1000x1000px** বা **2000x2000px**
- কালার মোড: **sRGB** (ওয়েবের জন্য CMYK নয়)`
  },

  sky_replace: {
    en: () => `## Sky Replacement in Photoshop (PS 2020+)

### ✅ Method 1: Automatic Sky Replacement (Easiest)
\`\`\`
1. Open your landscape/outdoor photo
2. Go to Edit > Sky Replacement
3. Click the sky thumbnail to choose from presets
4. OR click the "+" icon to import your own sky
5. Adjust:
   - Shift Edge: blend sky boundary
   - Fade Edge: soften the edge
   - Sky Brightness, Temperature
   - Foreground Lighting (matches foreground to sky)
6. Output: New Layers (keeps it editable)
\`\`\`

### ✅ Method 2: Manual Sky Replacement (More Control)
\`\`\`
1. Open original photo
2. Select sky: Select > Sky (PS 2020+)
   OR use Select Subject → inverse
3. Create a Layer Mask on original layer
4. Place new sky image as layer BELOW
5. Resize/position the new sky
6. Match colors with Color Balance adjustment
\`\`\`

### 🌈 Matching Foreground to New Sky
- Add **Color Lookup** adjustment layer (clipped to foreground)
- Or use **Photo Filter** matching sky temperature
- **Hue/Saturation** to match foreground saturation

### 💡 Tips
- Works best with a clear sky-to-ground boundary
- Use **Select and Mask** for trees/complex edges
- Available in: Photoshop 2020 (v22.0) and later`,

    bn: () => `## Photoshop-এ Sky Replacement (PS 2020+)

### ✅ পদ্ধতি ১: স্বয়ংক্রিয় Sky Replacement (সহজতম)
\`\`\`
১. আপনার ল্যান্ডস্কেপ/বাইরের ছবি খুলুন
২. Edit > Sky Replacement-এ যান
৩. প্রিসেট থেকে আকাশ থাম্বনেইল ক্লিক করুন
৪. অথবা নিজের আকাশ আমদানিতে "+" আইকন ক্লিক করুন
৫. সামঞ্জস্য করুন:
   - Shift Edge: আকাশের সীমানা ব্লেন্ড করুন
   - Sky Brightness, Temperature
   - Foreground Lighting (foreground আকাশের সাথে মেলান)
৬. Output: New Layers (সম্পাদনযোগ্য রাখে)
\`\`\`

### ✅ পদ্ধতি ২: ম্যানুয়াল Sky Replacement
\`\`\`
১. মূল ছবি খুলুন
২. আকাশ সিলেক্ট করুন: Select > Sky (PS 2020+)
৩. মূল লেয়ারে Layer Mask তৈরি করুন
৪. নতুন আকাশ ছবি নিচে লেয়ার হিসেবে রাখুন
৫. নতুন আকাশ পুনরায় আকার দিন/স্থাপন করুন
\`\`\`

### 💡 টিপস
- স্পষ্ট আকাশ-থেকে-মাটি সীমানায় সেরা কাজ করে
- গাছ/জটিল প্রান্তের জন্য **Select and Mask** ব্যবহার করুন`
  },

  blend_modes: {
    en: () => `## All 27 Photoshop Blending Modes Explained

### 📦 Normal Group
- **Normal** — No blending, full opacity replaces layer below
- **Dissolve** — Random pixel dithering for rough texture effect

### 🌑 Darken Group (Result is always darker)
- **Darken** — Shows whichever pixel is darker
- **Multiply** — Like layering transparent film; always darkens ⭐
- **Color Burn** — Increases contrast in darks; very rich shadows
- **Linear Burn** — Stronger than Color Burn
- **Darker Color** — Compares total values, keeps darkest

### 🌕 Lighten Group (Result is always lighter)
- **Lighten** — Shows whichever pixel is lighter
- **Screen** — Opposite of Multiply; always lightens ⭐
- **Color Dodge** — Brightens by reducing contrast; blown highlights
- **Linear Dodge (Add)** — Stronger; adds brightness
- **Lighter Color** — Shows brightest pixels overall

### 🎭 Contrast Group
- **Overlay** — Multiply on darks + Screen on lights ⭐ (most used!)
- **Soft Light** — Gentle version of Overlay
- **Hard Light** — Strong contrast; like shining a hard spotlight
- **Vivid Light** — Burns or Dodges based on blend color
- **Linear Light** — Extreme contrast enhancement
- **Pin Light** — Replaces based on brightness comparison
- **Hard Mix** — Extreme: only black and white result

### 🔄 Inversion Group
- **Difference** — Inverts based on brightness; black = no change
- **Exclusion** — Softer version of Difference
- **Subtract** — Subtracts; result is always darker
- **Divide** — Lightens based on division

### 🎨 Color Group
- **Hue** — Takes hue of blend, keeps base luminance/saturation
- **Saturation** — Takes saturation of blend layer
- **Color** — Takes hue + saturation (great for colorizing!) ⭐
- **Luminosity** — Takes lightness only ⭐ (great for sharpening)

### ⭐ Most Used in Practice
1. **Multiply** — Shadows, darkening
2. **Screen** — Highlights, lightening
3. **Overlay** — Texture overlay, contrast
4. **Color** — Colorizing, tinting
5. **Luminosity** — Sharpening layers`,

    bn: () => `## Photoshop-এর সকল ২৭টি Blending Mode ব্যাখ্যা

### 📦 Normal গ্রুপ
- **Normal** — কোনো ব্লেন্ডিং নেই, পূর্ণ অস্বচ্ছতা নিচের লেয়ার প্রতিস্থাপন করে
- **Dissolve** — র‍্যান্ডম পিক্সেল dithering; রুক্ষ টেক্সচার ইফেক্ট

### 🌑 Darken গ্রুপ (সবসময় গাঢ় করে)
- **Darken** — যে পিক্সেল বেশি গাঢ় তা দেখায়
- **Multiply** — স্বচ্ছ ফিল্ম স্তরের মতো; সবসময় গাঢ় করে ⭐
- **Color Burn** — গাঢ় রঙে কনট্রাস্ট বাড়ায়

### 🌕 Lighten গ্রুপ (সবসময় উজ্জ্বল করে)
- **Lighten** — যে পিক্সেল বেশি উজ্জ্বল তা দেখায়
- **Screen** — Multiply-র বিপরীত; সবসময় উজ্জ্বল করে ⭐
- **Color Dodge** — কনট্রাস্ট কমিয়ে উজ্জ্বল করে

### 🎭 Contrast গ্রুপ
- **Overlay** — গাঢ়তে Multiply + উজ্জ্বলতে Screen ⭐ (সবচেয়ে বেশি ব্যবহৃত!)
- **Soft Light** — Overlay-র মৃদু ভার্সন
- **Hard Light** — শক্তিশালী কনট্রাস্ট

### 🎨 Color গ্রুপ
- **Hue** — blend-এর hue নেয়, base-এর luminance/saturation রাখে
- **Color** — hue + saturation নেয় (রঙ দেওয়ার জন্য দারুণ!) ⭐
- **Luminosity** — শুধু আলোক নেয় ⭐ (sharpening-এর জন্য দারুণ)

### ⭐ ব্যবহারিকভাবে সবচেয়ে বেশি ব্যবহৃত
1. **Multiply** — Shadows, গাঢ় করা
2. **Screen** — Highlights, উজ্জ্বল করা
3. **Overlay** — টেক্সচার ওভারলে, কনট্রাস্ট
4. **Color** — রঙ দেওয়া, tinting
5. **Luminosity** — Sharpening লেয়ার`
  },

  translate: {
    en: (text) => `I can help translate between **Bangla and English**!

**Bangla → English** examples:
- "ফটোশপ" = "Photoshop"  
- "লেয়ার" = "Layer"
- "ব্যাকগ্রাউন্ড রিমুভ" = "Background removal"
- "ক্লিপিং পাথ" = "Clipping path"
- "ঘোস্ট ম্যানেকিন" = "Ghost mannequin"
- "রঙ সংশোধন" = "Color correction"

**English → Bangla** examples:
- "Pen Tool" = "পেন টুল"
- "Selection" = "নির্বাচন / সিলেকশন"
- "Adjustment Layer" = "অ্যাডজাস্টমেন্ট লেয়ার"
- "Healing Brush" = "হিলিং ব্রাশ"

Please tell me the specific word or sentence you want translated!`,

    bn: () => `আমি **বাংলা ও ইংরেজি**-র মধ্যে অনুবাদ করতে পারি!

**বাংলা → ইংরেজি** উদাহরণ:
- "লেয়ার" = "Layer"
- "ব্যাকগ্রাউন্ড রিমুভ" = "Background removal"
- "ক্লিপিং পাথ" = "Clipping path"
- "রঙ সংশোধন" = "Color correction"

**ইংরেজি → বাংলা** উদাহরণ:
- "Pen Tool" = "পেন টুল"
- "Selection" = "নির্বাচন"
- "Healing Brush" = "হিলিং ব্রাশ"
- "Adjustment Layer" = "অ্যাডজাস্টমেন্ট লেয়ার"

আপনি যে নির্দিষ্ট শব্দ বা বাক্য অনুবাদ করতে চান তা বলুন!`
  },

  general: {
    en: (text) => {
      const t = text.toLowerCase();
      // Check if asking about a specific PS version
      const versionMatch = t.match(/photoshop\s*(cs\d?|cc\s?\d{4}?|\d\.\d|\d{4})/i);
      if (versionMatch) {
        return `You're asking about **Adobe Photoshop ${versionMatch[1]}**!

I have complete knowledge of this version. Here are some key facts:

**What version are you specifically curious about?**
- The tools it introduced?
- Its system requirements?
- Key differences from other versions?
- How to use a specific feature in that version?

Please specify your question and I'll give you a detailed answer!`;
      }
      return `I'm **PhotoAI** — your Adobe Photoshop expert! 🎨

I understand your question. Here's what I can tell you:

You can ask me about:
- 📸 **Photoshop techniques** — any tool, any version
- 🌍 **Bangla ↔ English** translation
- 🎨 **Design workflows** — background removal, retouching, color grading
- 👕 **E-commerce editing** — ghost mannequin, clipping path
- ✨ **AI features** — Generative Fill, Neural Filters

Could you be more specific about what you'd like to know? I'm here to help!`;
    },
    bn: (text) => {
      return `আমি **PhotoAI** — আপনার Adobe Photoshop বিশেষজ্ঞ! 🎨

আপনার প্রশ্নটি বুঝতে পেরেছি। আপনি আমাকে জিজ্ঞেস করতে পারেন:

- 📸 **Photoshop টেকনিক** — যেকোনো টুল, যেকোনো ভার্সন
- 🌍 **বাংলা ↔ ইংরেজি** অনুবাদ
- 🎨 **ডিজাইন ওয়ার্কফ্লো** — ব্যাকগ্রাউন্ড রিমুভ, রিটাচিং, কালার গ্রেডিং
- 👕 **ই-কমার্স এডিটিং** — ঘোস্ট ম্যানেকিন, ক্লিপিং পাথ
- ✨ **AI ফিচার** — Generative Fill, Neural Filters

আপনি আরও নির্দিষ্টভাবে জানতে চাইলে বলুন!`;
    }
  }
};

// ── Main Response Generator ─────────────────────────────────
function generateResponse(userMessage) {
  const lang   = detectLanguage(userMessage);
  const intent = detectIntent(userMessage);

  const topic = KB[intent];
  if (!topic) {
    return lang === 'bn'
      ? KB.general.bn(userMessage)
      : KB.general.en(userMessage);
  }

  // Some topics have function forms, some have text
  if (typeof topic.bn === 'function' && typeof topic.en === 'function') {
    return lang === 'bn' ? topic.bn(userMessage) : topic.en(userMessage);
  }

  return lang === 'bn' ? topic.bn : topic.en;
}

module.exports = { generateResponse, detectLanguage, detectIntent };
