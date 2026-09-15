# 🏛️ समाधान सेतु — Samadhan Setu

> **आपकी समस्या, हमारा समाधान** | Your Problem, Our Solution

A citizen-facing civic issue reporting mobile app for Jharkhand, India. Designed for **low-literacy, rural users** — every screen is usable through icons, photos, color-coded status, and voice, not text.

## 🎨 Design Philosophy

- **Sohrai-Inspired**: Earthy color palette inspired by Jharkhand's Sohrai-Khovar tribal painting tradition
- **Recognition over Literacy**: Icon-first, text-second design
- **Camera-First Reporting**: Photo → GPS → Category → Voice Note → Submit
- **Offline-First**: Never fails, always saves locally and syncs when possible
- **Accessibility**: 🔊 Voice guide on every screen, 48px+ touch targets, color+icon+text status

## 🚀 Tech Stack

- **Framework**: React Native (Expo SDK 57, TypeScript)
- **Navigation**: Expo Router (file-based)
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React Native + Emoji fallbacks
- **Styling**: React Native StyleSheet with Sohrai design tokens
- **i18n**: i18next (Hindi default, English, Santhali/Ho/Mundari ready)
- **Offline**: AsyncStorage-based queue + auto-sync
- **Voice**: expo-speech (TTS), voice-note recording

## 📱 Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Home | `/` | Public landing, trust counters, guest flow |
| Register | `/register` | 3-step wizard (Name → Location → OTP) |
| Login | `/login` | OTP-first, password secondary |
| Dashboard | `/(tabs)/dashboard` | Stats, my reports, floating FAB |
| Submit | `/(tabs)/submit` | Camera-first report flow |
| Problems | `/(tabs)/problems` | Public feed with filters |
| Detail | `/(tabs)/problems/[id]` | Timeline, confirmation gate, rating |
| Notifications | `/(tabs)/notifications` | Voice-read notifications |
| Profile | `/(tabs)/profile` | Edit, language, referral |
| Analytics | `/(tabs)/analytics` | Citizen-facing simple stats |

## 🏃 Quick Start

```bash
npm install
npx expo start
```

## 📝 Demo Notes

- **Mock OTP**: Any phone, OTP is `123456`
- **Mock Data**: 7 seeded problems in Ranchi for demo
- **Duplicate Detection**: Submit a "water" problem near Ranchi to trigger
- **Confirmation Gate**: Problem `prob_006` is in `pending_confirmation` state
- **Hindi TTS**: Requires Hindi voice pack on device (test on physical device!)

## 🎯 Hackathon Features

- ✅ Camera-first submission (3-tap rule)
- ✅ Duplicate detection with "me too" support
- ✅ Emergency fast-track (🚨 sindoor red)
- ✅ Citizen confirmation gate (provisional resolution)
- ✅ Offline-first queue with auto-sync
- ✅ Voice guide on every screen
- ✅ Sohrai-inspired SVG borders
- ✅ i18n (Hindi/English + Santhali/Ho/Mundari structure)
- ✅ Referral ("Apne gaon ko batao")
- ✅ Image compression before upload

---

*Built for SIH 2026 — Citizen portal only. Admin, University, Industry, Local Body portals are separate.*
