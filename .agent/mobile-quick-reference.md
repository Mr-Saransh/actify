# ACTIFY Mobile Enhancement - Quick Reference

## 🎯 Key Mobile Changes at a Glance

### Header (Always Visible)
```
Mobile:  ☰ ACTIFY        ⟁214 | +12  👤
Desktop: [Sidebar]       TOTAL ⟁ | ACTIVE ⟁  👤
```

### Dashboard Layout Priority (Mobile)

#### 1️⃣ STICKY HEADER (Top of viewport)
```
╔═══════════════════════════════════╗
║ HEALTH | 15/01/26 | 12/20 | 60%  ║ ← Goal Intelligence
╚═══════════════════════════════════╝
```

#### 2️⃣ TODAY'S TASK (Dominates screen)
```
╔═══════════════════════════════════╗
║  DO OR FAIL | L12 // Protocol    ║
║                                   ║
║  COMPLETE 50 PUSH-UPS            ║
║                                   ║
║  Required Output:                 ║
║  Submit photo proof...            ║
║                                   ║
║  ┌──────────────────────────┐   ║
║  │ ▶ SUBMIT PROOF NOW      │   ║ ← PRIORITY CTA
║  └──────────────────────────┘   ║
║                                   ║
║  ☐ Valid content URL             ║
║  ☐ Detailed logic                ║
║  ☐ No hesitation                 ║
╚═══════════════════════════════════╝
```

#### 3️⃣ ENFORCEMENT DATA (Always Expanded)
```
╔═══════════════════════════════════╗
║ ⚡ Enforcement Data               ║
║ Speed: 2.1    Required: 2.5      ║
║ Status: BEHIND SCHEDULE          ║
║ Probability: 65%                 ║
╚═══════════════════════════════════╝
```

#### 4️⃣ COLLAPSED PANELS (Tap to expand)
```
▼ Ego / Impact          ← Collapsed by default
▼ Risk Forecast         ← Collapsed by default
```

#### 5️⃣ EXECUTION PATH (Horizontal Scroll)
```
═══════════════════════════════════→
 1  2  3  4 【5】 🔒6  🔒7  ... 
═══════════════════════════════════→
      Swipe to see more →
```

---

## 📏 Size Comparison Table

| Element | Mobile | Desktop |
|---------|--------|---------|
| Component Padding | `p-3` | `p-4` or `p-6` |
| Card Corners | `rounded-none` | `rounded-lg` |
| Typography Labels | `text-[9px]` | `text-[10px]` |
| Typography Body | `text-xs` | `text-sm` |
| Icons | `h-3 w-3` | `h-4 w-4` |
| Vertical Spacing | `space-y-4` | `space-y-8` |
| Horizontal Gaps | `gap-3` | `gap-4` |

---

## 🎨 Mobile Design Tokens

### Colors (Unchanged)
- Background: `bg-black`
- Primary: `text-red-500`
- Border: `border-zinc-800`
- Text: `text-white` / `text-zinc-400`

### Shape (Mobile-Specific)
- Sharp edges: `rounded-none`
- System-like: No decorative shadows
- Terminal feel: Clean borders

### Spacing (Compressed)
- Tight: 25% less padding
- Dense: Reduced vertical gaps
- Compact: Smaller fonts

---

## 🔄 Responsive Breakpoints

All changes use Tailwind's `md:` breakpoint (768px):

```tsx
// Mobile-first approach
className="p-3 md:p-6"          // Mobile: p-3, Desktop: p-6
className="text-xs md:text-sm"  // Mobile: xs, Desktop: sm
className="hidden md:block"     // Mobile: hidden, Desktop: visible
className="md:hidden"           // Mobile: visible, Desktop: hidden
```

---

## ✓ Test Checklist

### Mobile Testing (< 768px)
- [ ] ⟁ currency shows as "⟁214 | +12" format
- [ ] Goal Intelligence header is sticky
- [ ] Submit Proof button is above fold
- [ ] Ego/Impact panel is collapsed by default
- [ ] Risk Forecast panel is collapsed by default
- [ ] Enforcement Data is always expanded
- [ ] Execution Path scrolls horizontally
- [ ] All cards have sharp corners
- [ ] Sidebar opens as full-height sheet
- [ ] Padding is noticeably tighter

### Desktop Testing (≥ 768px)
- [ ] ⟁ currency shows full format with labels
- [ ] Sidebar is always visible
- [ ] All panels are expanded
- [ ] No layout changes vs. original
- [ ] Rounded corners preserved
- [ ] Original spacing maintained

---

## 🚨 Mobile Behavior Rules

### Always Visible on Mobile
1. Goal Intelligence (sticky header)
2. Today's Task card
3. Submit Proof button
4. Enforcement Data panel
5. ACT currency (⟁)

### Collapsed by Default
1. Ego / Impact panel
2. Risk Forecast panel
3. System Rules (scrolled below fold)

### User Interaction Required
1. Expand collapsed panels (tap chevron)
2. Scroll execution path (swipe left/right)
3. Open sidebar (tap hamburger menu)

---

## 📱 Testing URLs

Once development server is running:

**Desktop View**: http://localhost:3000/dashboard
**Mobile View**: http://localhost:3000/dashboard (resize browser < 768px)

**Chrome DevTools Mobile Emulation**:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select device: iPhone 14 Pro / Galaxy S20
4. Refresh page

---

## 🎯 Success Criteria Met

✅ MVP maintained - no new features
✅ Desktop UI unchanged - responsive only
✅ No new sections or data - reorganized only  
✅ ACT as system status - not gamified
✅ Mobile terminal feel - sharp, dense, focused
✅ Primary CTA above fold - Submit Proof prioritized
✅ Build successful - TypeScript passed
✅ All constraints satisfied

**Result**: Production-ready mobile enhancement maintaining ACTIFY's enforcement-focused design while optimizing for mobile execution workflows.
