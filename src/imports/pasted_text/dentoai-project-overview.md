# **AI Prompt: Build DentoAI – AI-Powered Dental Screening & Doctor Consultation Platform**

## Project Overview

Build a **production-ready, enterprise-grade, responsive full-stack web application** called **DentoAI**.

DentoAI is an AI-assisted dental screening platform where a patient captures images of their mouth, receives an AI-generated screening report, and securely sends the case to a selected doctor. The doctor reviews the same AI report, examines all uploaded and AI-enhanced images, and provides a professional diagnosis and treatment summary.

The application should have a modern healthcare SaaS design, clean architecture, scalable codebase, secure authentication, and be built so that demo AI can later be replaced with a real AI model without changing the frontend.

---

# Roles

There are **ONLY TWO ROLES**.

* Patient
* Doctor

No Admin Panel.

---

# Tech Stack

## Frontend

* Next.js 15 (App Router)
* React 19
* TypeScript
* Tailwind CSS
* ShadCN UI
* Framer Motion
* React Hook Form
* React Query
* Axios
* Zod
* Lucide Icons

---

## Backend

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* JWT Authentication
* Multer
* Socket.IO
* Swagger Documentation

---

## Storage

* Local Storage during development
* Architecture should support AWS S3 / Cloudflare R2 later.

---

## AI Layer

The AI should be modular.

Create an `AIService` layer so that later we can simply replace demo responses with:

* OpenAI Vision
* Gemini Vision
* MedGemma
* Custom CNN
* YOLO
* Segmentation Models

without changing frontend code.

---

# Authentication

Both roles have

* Register
* Login
* Forgot Password
* Reset Password
* JWT Authentication
* Protected Routes
* Role Based Access

---

# Application Pages

---

# PUBLIC PAGES

* Landing Page
* About
* Contact
* Login
* Register
* Forgot Password
* Reset Password

---

# PATIENT FEATURES

---

# 1. Patient Dashboard

Modern medical dashboard.

Show

* Welcome Card
* Current Report Status
* Last Scan
* Last Doctor
* Total Scans
* Pending Reviews
* Completed Reports
* Recent Reports
* New Mouth Scan Button

Beautiful charts and cards.

---

# 2. Mouth Scan Page (Core Feature)

This is the most important page.

---

## Step 1

Patient selects a doctor.

Display doctors as premium cards.

Each card contains

* Doctor Photo
* Doctor Name
* Qualification
* Specialization
* Experience
* Hospital / Clinic
* Rating
* Available Status

Patient clicks

**Select Doctor**

---

## Step 2

Open Camera

Use browser camera.

Show professional camera UI.

Provide live guidance.

Examples

✔ Good Lighting

✔ Open Mouth Wider

✔ Keep Camera Steady

✔ Move Closer

✔ Face Detected

✔ Mouth Detected

✔ Camera Angle OK

If image quality is poor

Ask user to retake.

---

## Step 3

Capture Mouth Images

Allow

* Front View
* Upper Teeth
* Lower Teeth
* Tongue
* Gum
* Problem Area

Multiple images supported.

---

## Step 4

AI Enhancement

Immediately after upload,

show beautiful loading animation.

Loading Steps

Uploading Images...

Enhancing Images...

Generating Diagnostic Views...

Running AI Analysis...

Creating Report...

---

## Step 5

Automatic AI Image Enhancement

Generate

* Original Image
* Sharpened Image
* Super Resolution
* Contrast Enhanced
* Brightness Corrected
* Diagnostic Highlight
* Edge Detection
* Heatmap

---

## Step 6

Automatic Multi Angle Generation

If enough image information exists,

generate demo diagnostic views.

Examples

* Left Side
* Right Side
* Upper Teeth
* Lower Teeth
* Tongue Close-up
* Gum Close-up
* Oral Cavity Overview

These images must clearly display

**AI Generated Demo View**

or

**AI Estimated View**

because they are not actual photographs.

Provide

* Zoom
* Fullscreen
* Before / After
* Image Slider

---

## Step 7

AI Disease Detection

Analyze images.

Possible diseases

* Mouth Ulcer
* Gingivitis
* Tooth Decay
* Plaque
* Dental Caries
* Gum Swelling
* Gum Bleeding
* White Patch
* Oral Thrush
* Tongue Infection
* Tooth Discoloration
* Suspicious Lesions
* Cracked Tooth
* Broken Tooth

Each prediction contains

Disease Name

Confidence

Severity

Affected Region

Description

Recommendation

Highlighted Area

---

## Step 8

Automatic Submission

After report generation,

automatically send

* Original Images
* Enhanced Images
* AI Generated Views
* AI Report

to the selected doctor.

---

# 3. Current Report Page

Patient sees

## AI Screening Report

Contains

* Scan Date
* AI Findings
* Confidence
* Severity
* Disease Description
* Images
* Highlighted Area
* Recommendation

Below AI report,

display

## Doctor Report

Doctor can write

* Diagnosis
* Notes
* Medicines
* Treatment Plan
* Prescription
* Follow-up Advice

Status

* Pending
* Reviewed
* Completed

Download PDF button.

---

# 4. Report History

Timeline view.

Every previous scan.

Each report card shows

* Scan Date
* Doctor
* Disease
* AI Status
* Doctor Status
* Download PDF
* View Report

---

# 5. Patient Profile

Contains

* Photo
* Name
* Email
* Phone
* DOB
* Gender
* Address

Buttons

* Edit Profile
* Change Password
* Logout

---

# DOCTOR FEATURES

---

# 1. Doctor Dashboard

Show

* Total Patients
* Pending Reviews
* Completed Reports
* Today's Cases
* Recent Patients
* Notifications

Modern analytics cards.

---

# 2. Patients Page

Doctor sees every patient who selected them.

Display patient cards.

Each card

* Patient Photo
* Name
* Age
* Gender
* Scan Date
* Status

Click card

Open patient details.

---

# Patient Details Page

Doctor should see

Patient Information

Original Images

Enhanced Images

AI Generated Views

Image Gallery

Zoom

Fullscreen

Before / After Comparison

Heatmap

---

## AI Report

Doctor sees the exact AI report that the patient sees.

No difference.

---

## Doctor Report Editor

Doctor writes

* Diagnosis
* Findings
* Prescription
* Medicines
* Treatment Plan
* Notes
* Follow-up Date

Submit Report.

Once submitted,

patient instantly receives report.

---

# 3. Doctor Profile

Contains

* Photo
* Name
* Qualification
* Registration Number
* Experience
* Hospital
* Clinic
* Specialization
* Contact
* About

Buttons

* Edit Profile
* Change Password
* Logout

---

# Demo Mode (Important)

Since no real AI model is connected yet,

the application must work using demo data.

---

## Demo Images

Create realistic oral images for

* Healthy Mouth
* Mouth Ulcer
* Gingivitis
* Tooth Decay
* Plaque
* Gum Swelling
* White Patch
* Tongue Infection
* Broken Tooth

Store inside

```
/public/demo-images
```

---

## Demo AI Reports

Store JSON files

```
/mock-data/reports
```

Each contains

```
Disease

Confidence

Severity

Recommendation

Images

Highlighted Area

Description
```

---

## Demo Processing

After upload

simulate AI

using loading animations.

After 3–5 seconds,

return demo report.

---

## Demo Enhanced Images

Create demo versions

* Sharpened
* Brightness
* Contrast
* Heatmap
* Super Resolution
* AI Generated Left View
* AI Generated Right View
* AI Generated Tongue View

These should be labeled

```
Demo Image
```

or

```
AI Generated Demo View
```

---

## Doctor Demo

Doctor receives

same demo report

same images

writes report

patient receives instantly.

---

# Notifications

Show toast notifications.

Examples

Report Generated

Doctor Selected

Images Uploaded

Report Submitted

Doctor Reviewed Report

---

# Search

Doctor can search patients.

Patient can search reports.

---

# Filters

Reports

* Pending

* Completed

* Latest

* Oldest

---

# Security

Implement

* JWT
* Password Hashing
* Secure File Upload
* File Validation
* Rate Limiting
* SQL Injection Protection
* XSS Protection
* HTTPS Ready

---

# UI Design

The UI must look like a premium AI healthcare platform.

Use

* Blue
* White
* Teal

Design Style

* Glassmorphism
* Rounded Cards
* Soft Shadows
* Beautiful Animations
* Responsive
* Mobile First
* Dark Mode
* Light Mode
* Accessibility (WCAG)

---

# Folder Structure

Follow enterprise architecture.

```
client/
    app/
    components/
    hooks/
    services/
    lib/
    types/
    utils/
    assets/

server/
    auth/
    doctor/
    patient/
    report/
    ai/
    uploads/
    middleware/
    prisma/
    routes/
    services/
    utils/

shared/
mock-data/
public/demo-images/
```

---

# Database Schema

Create complete PostgreSQL schema for

* Users
* Patients
* Doctors
* MouthScans
* UploadedImages
* EnhancedImages
* AIReports
* DoctorReports
* Notifications
* Sessions

Use proper foreign keys, indexes, timestamps, and relationships.

---

# API Endpoints

Create REST APIs for:

### Authentication

* Register
* Login
* Forgot Password
* Reset Password
* Logout
* Refresh Token

### Patient

* Get Dashboard
* Get Doctors
* Upload Scan
* Generate AI Report (Demo)
* Get Current Report
* Get Report History
* Get Profile
* Update Profile

### Doctor

* Get Dashboard
* Get Patients
* Get Patient Details
* Submit Doctor Report
* Get Profile
* Update Profile

---

# Expected Deliverables

Generate a complete production-ready project including:

* Modern multi-page responsive frontend
* Secure Express.js backend
* PostgreSQL + Prisma database
* JWT Authentication
* Role-Based Access Control (Patient & Doctor)
* Doctor selection workflow
* Camera integration for mouth image capture
* Demo AI image enhancement pipeline
* AI-generated demo multi-angle visualization
* AI screening report generation using mock data
* Doctor review and report workflow
* Patient current report and report history
* PDF report generation
* Clean REST APIs with Swagger documentation
* Docker support
* Modular, scalable folder structure
* Enterprise-grade code quality with comments and best practices

## Important Notes

* **For the MVP, use demo images, mock AI reports, and simulated processing.**
* **Design the architecture so replacing the demo `AIService` with a real AI API requires minimal changes.**
* **All AI-generated images that are not actual photographs must be clearly labeled as "AI Generated Demo View" or "AI Estimated View".**
* **Every AI report must display a disclaimer stating that it is a screening aid only and that the final diagnosis and treatment decisions are made by the licensed doctor.**
