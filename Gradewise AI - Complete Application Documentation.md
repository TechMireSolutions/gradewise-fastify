### **Project Overview: Grade Wise AI \- An Intelligent Assessment Platform**

* **Advanced Educational Tool:** Grade Wise AI is a sophisticated platform that uses artificial intelligence to automate the entire assessment process for educational institutions.  
* **Core Purpose:** Its primary goal is to reduce instructor workload and provide a tailored learning experience for students through end-to-end automation, from question generation to providing explainable feedback.  
* **Role-Specific Portals:** The platform offers dedicated, secure portals for Administrators, Instructors, and Students.  
* Powered by robust Large Language Model (LLM) APIs such as Google Gemini, ChatGPT, and Claude, the system dynamically generates assessments, reviews student submissions, and delivers comprehensive reports.  
* 

  ### **Application Architecture & User Flow**

* **Design Philosophy:** The platform's architecture prioritizes clarity, security, and ease of use by directing users to environments tailored to their specific roles.  
* **User Entry Point:**  
  * **Unified Sign-In Portal:** All users (Admins, Instructors, and Students) access the platform through a single, secure home page for authentication.  
* **Role-Specific Environments:**  
  * **Automated Routing:** After a successful sign-in, the system automatically identifies the user's role and directs them to a dedicated dashboard.  
  * **Dedicated Dashboards:**  
    * **Admin Dashboard:** A central hub for user management, system-wide analytics, AI configuration, adding user , monitoring assessments and students performances and monitoring API costs.  
    * **Instructor Dashboard:** A complete workspace for managing students, uploading course resources, creating assessment using resources, and reviewing student performance.  
    * **Student Dashboard:** A personalized and localized portal for taking assessments, tracking progress, and reviewing detailed AI-generated feedback.

    ### **User Roles and Capabilities**

The application enforces a strict Role-Based Access Control (RBAC) model with three distinct roles:

##### **A. The Administrator (Admin)**

The Administrator holds the highest level of authority, ensuring the platform's integrity, operational health, and strategic configuration.

* **User and Role Management:**  
  * Register new Instructors and Students, either individually or through bulk uploads.  
  * View and manage all user profiles, including modifying user roles (e.g., promoting a Student to an Instructor).  
* **AI Ecosystem Configuration:**  
  * Manage the full AI pipeline by securely adding API keys for various providers and configuring integration endpoints.  
  * Strategically select and fine-tune AI models for specific tasks like question generation or evaluation to balance cost, speed, and quality.  
* Creating question types  
  * Extend the platform's capabilities by defining new, custom question types.  
* **Platform Oversight and Analytics:**  
  * Utilize a comprehensive dashboard to monitor system-wide trends and key performance indicators.  
  * Perform audits and review all system data, including instructor activity, student performance, and the complete historical records of every assessment attempt.  
* **Personal Profile Management:**  
  * View and edit their own profile details.

    ##### **B. The Instructor**

As the architect of the educational experience, the Instructor is responsible for creating the content and frameworks that guide the AI.

* **Student and Course Management:**  
  * Manage the student lifecycle by registering new accounts and enrolling students into specific assessments .  
* **Content and Assessment Design:**  
  * Upload a diverse range of course resources (text ,files (PDF, .txt, .docx and popular formats ), links(video or webpage) which the system automatically vectorizes for AI analysis.  
  * Design dynamic assessment by defining rules for the AI, including question types, count, points, time limits, and generation guidelines.

Question Blocks:

* Mcqs (number of questions, duration for each question, number of options , positive marks, negative marks.  
* Short answers (number of questions, duration for each question , positive marks, negative marks.

* True False  (number of questions, duration for each question, positive marks, negative marks.

* Matching Questions  (number of questions, duration for each question, number of first side options ,number of second , side options, positive marks, negative marks.

* **Performance Analytics and Reporting:**  
  * Analyze detailed, AI-generated reports for individual students to track progress.  
  * Leverage high-level analytics for entire assessments to identify class-wide trends and challenging topics.  
* **Administrative Functions:**  
  * Generate printable, paper-based versions of assessments and their answer keys for offline use.  
  * Manage their own profile information, with the restriction that they cannot alter their assigned role.

    ##### **C. The Student**

The Student engages with a personalized and adaptive learning ecosystem designed to support their academic journey.

* **Immersive & Localized Experience:**  
  * Students begin assessments by selecting a preferred language (**English, Urdu, Arabic, or Persian**), which instantly translates the entire interface and dynamically switches the layout between **Left-to-Right (LTR)** and **Right-to-Left (RTL)** for a natural, intuitive experience.  
  * The AI then generates a unique, timed assessment in real-time, tailored to the selected language and the instructor's blueprint.  
* **Intelligent Feedback & Personalized Growth:**  
  * Upon submission, the AI provides instant, automated evaluation, delivering a detailed report with the score, original question, student's answer, and the correct answer.  
  * To ensure true understanding, each answer is justified with a **contextual snippet** from the source material. Students can request deeper AI-generated explanations for concepts they misunderstood (XAI).  
  * Based on performance, the AI can generate a **Personalized Study Guide** to help students focus on areas that need improvement.  
* **Performance & Profile Management:**  
  * Students can access a complete history of their past assessments from their dashboard to track progress over time.  
  * They can manage their own profile information, but cannot change their assigned role.

    #### **4\. Design Principles & Technology Stack**

The platform is engineered on a foundation of industry-leading design principles and a modern technology stack to ensure quality, scalability, and an exceptional user experience.

* **Software Architecture:**  
  * The codebase strictly adheres to **SOLID** and the **Single Responsibility Principle (SRP)**. This commitment ensures the application is modular, maintainable, and scalable, allowing for future features to be added with minimal complexity.  
* **UI/UX Design:**  
  * The user interface is built on modern best practices, prioritizing intuitive navigation, accessibility, and clarity.  
  * A **mobile-first responsive policy** guarantees a seamless and consistent experience across all devices, from desktops to smartphones.

Question Blocks:

* Mcqs (number of questions, duration for each question, number of options , positive marks, negative marks.  
* Short answers (number of questions, duration for each question , positive marks, negative marks.

* True False  (number of questions, duration for each question, positive marks, negative marks.

* Matching Questions  (number of questions, duration for each question, number of first side options ,number of second , side options, positive marks, negative marks.

### Grade Wise AI: Enhanced Platform Overview

1\. Core Concept

An intelligent platform designed to fully automate the educational assessment lifecycle.

* Functions: Handles AI-powered question generation, automated evaluation, and provides rich, personalized feedback.  
* Goal: To reduce instructor workload, streamline administration, and deliver tailored learning paths for students.  
* Architecture: Features secure, dedicated portals for Administrators, Instructors, and Students, powered by leading Large Language Model (LLM) APIs.

2\. Platform Architecture & Workflow

* Unified Sign-In: A single, secure portal serves as the entry point for all users.  
* Automated Role-Based Routing: Upon authentication, the system automatically directs users to their designated dashboard.  
* Dedicated Dashboards:  
  * Admin: A central hub for managing users, configuring the AI ecosystem, monitoring system-wide analytics, and overseeing API costs.  
  * Instructor: A comprehensive workspace for managing students, curating course resources, designing assessments, and analyzing performance data.  
  * Student: A personalized portal for taking assessments, accessing a complete performance history, and reviewing detailed, AI-generated feedback.

3\. User Roles & Capabilities

A. Administrator: Platform Governance

* User Management:  
  * Register new Instructors and Students, either individually or via bulk upload.  
  * View, manage, and modify all user profiles and their assigned roles.  
* AI Ecosystem Configuration:  
  * Manage API keys and integration endpoints for all connected LLMs.  
  * Select and fine-tune AI models to balance cost, speed, and quality for different tasks.  
  * Define and create new, custom question types to expand assessment capabilities.  
* Platform Oversight & Auditing:  
  * Monitor system-wide trends and Key Performance Indicators (KPIs).  
  * Audit all system data, including user activity, content libraries, and assessment records.  
* Profile Management: View and edit their own profile details.

B. Instructor: Learning Experience Architect

* Student Management:  
  * Register new student accounts.  
  * Enroll students in specific assessments.  
* Content & Resource Management:  
  * Upload course resources in various formats (PDF, DOCX, TXT) and from links (videos, webpages).  
  * Set resource visibility (e.g., private to the instructor or available to others).  
* Assessment Creation & Configuration:  
  * Initiate a new assessment from available resources.  
  * Provide a unique name and define high-level AI directives (e.g., "Focus on conceptual understanding," "Generate application-based questions").  
  * Construct the assessment using Question Blocks, with customizable parameters for each type:  
    * Supported Types: Multiple Choice (MCQ), Short Answer, True/False, Matching.  
    * Parameters per Block:  
      * Number of Questions *(e.g., default: 5\)*  
      * Duration per Question *(e.g., default: 60s)*  
      * Positive Marks *(e.g., default: \+1)*  
      * Negative Marks *(e.g., default: \-0.25)*  
      * Type-Specific Options:  
        * *MCQ:* Number of choices *(e.g., default: 4\)*  
        * *Matching:* Number of options for each side *(e.g., defaults: 3 and 4\)*  
* Analytics & Reporting:  
  * Analyze detailed, AI-generated performance reports for individual students and entire assessments.  
  * Generate printable (paper) versions of assessments and their corresponding answer keys.  
* Profile Management: Manage their own profile; cannot change their assigned role.

C. Student: Personalized Learning Journey

* Immersive Assessment Experience:  
  * Select a preferred language (e.g., English, Urdu, Arabic, Persian) for a fully translated and localized (LTR/RTL) interface.  
  * Take unique, timed assessments generated in real-time by the AI based on the instructor's design.  
* Intelligent & Explainable Feedback (XAI):  
  * Receive instant, automated reports detailing the score, original question, submitted answer, and correct answer.  
  * View contextual justifications for correct answers, pulled directly from the source material.  
  * Request deeper, AI-generated explanations for misunderstood concepts.  
  * Receive a Personalized Study Guide generated by the AI based on performance to target areas for improvement.  
* Performance Tracking:  
  * Access a complete, filterable history of all past assessments to monitor progress.  
* Profile Management: Manage their own profile; cannot change their assigned role.

4\. Technical & Design Principles

* Software Architecture: Built on SOLID principles for a modular, maintainable, and scalable codebase.  
* User Experience (UX): A mobile-first, responsive design ensures a seamless and intuitive experience on all devices.  
* Core Technology: Driven by powerful and adaptable Large Language Model (LLM) APIs to power all intelligent features.

Assessment properties for Instructor:

1)Edit (if still anyone any student is it attempt)

2)Delete (if still anyone any student is it attempt)

3)View Prompt

4)Review assessment as a student ( run demo as a instructor)

5)Enroll student

6)View Analytics and results( in this section we need to add question/answe and all stats with respective of assessment)

7)Create a physical paper with key

8)View properties of his assessment

## 

## 

## 

## 

## 

## 

## 

## 

## 

## **3 oct 2025**

## **Gradewise AI: Intelligent Assessment Platform Blueprint**

### **I. Project Overview and Core Purpose**

* **Platform Name:** Grade Wise AI (Intelligent Assessment Platform)  
* **Core Function:** Fully automate the entire assessment lifecycle for educational institutions.  
* **Primary Goals:**  
  * Significantly reduce instructor workload.  
  * Deliver a tailored learning experience for every student.  
* **Automation Scope:** End-to-end, from dynamic question generation to rich, explainable feedback.  
* **AI Engine:** Powered by robust **Large Language Model (LLM) APIs** (including Google Gemini, ChatGPT, and Claude).  
* **Access:** Secure, dedicated portals for Administrators, Instructors, and Students.

### **II. Application Architecture and Workflow**

* **Design Philosophy:** Prioritizes clarity, security, and Role-Based Access Control (RBAC).  
* **Authentication:** All users access the system through a single, secure **Unified Sign-In Portal**.  
* **Routing:** Upon authentication, the system automatically identifies the user's role and directs them to their **Dedicated Dashboard**.  
* **Dashboard Functions:**  
  * **Admin Dashboard:** Central hub for system-wide configuration and financial oversight (API costs).  
  * **Instructor Dashboard:** Comprehensive workspace for course management and content creation.  
  * **Student Dashboard:** Personalized, localized environment for assessments and progress tracking.

### **III. User Roles and Capabilities**

#### **A. Administrator: Platform Governance and Oversight**

* **Authority:** Manages system integrity, operational health, and strategic configuration.  
* **Key Responsibilities:**  
  * **User and Role Management:**  
    * Register new Instructors and Students (individually or via bulk upload).  
    * Manage all user profiles.  
    * Modify roles (e.g., Student to Instructor).  
  * **AI Ecosystem Configuration:**  
    * Manage API keys and configure integration endpoints.  
    * Strategically select and fine-tune AI models (balancing cost, speed, and quality).  
  * **Platform Extension:** Define New Custom Question Types.  
  * **Oversight and Auditing:**  
    * Monitor system-wide **KPIs and Trends**.  
    * Review all system data (user activity, performance, assessment history, API costs).  
  * **Profile Management:** View and edit their own profile details.

#### **B. Instructor: Learning Experience Architect**

* **Role Focus:** Curate content and assessment frameworks for the AI.  
* **Student Management:**  
  * Register Accounts for students.  
  * Enroll students into specific assessments.  
* **Content Creation and Prep:**  
  * **Upload Diverse Resources:** Files (PDF, DOCX, TXT) and links (web/video).  
  * System automatically vectorizes resources for AI analysis.  
* **Dynamic Assessment Design:**  
  * Define AI generation rules, time limits, and point values.  
  * Structure assessments using **Question Blocks** for supported types:  
    * Multiple Choice (MCQ)  
    * Short Answer  
    * True/False  
    * Matching  
  * **Block Configuration Parameters:**  
    * Number of questions.  
    * Duration per question.  
    * Positive marks.  
    * Negative marks.  
    * Type-specific options (e.g., number of choices for MCQs).  
* **Assessment Properties Management:**  
  * view the assessment  
  * **Edit or Delete** the assessment (only if no student attempts exist).  
  * **View the concocted Prompt** used for AI generation.  
  * **Review it as a Student**.  
  * **Manage Enrolment**.  
  * **View Analytics and Results**.  
  * **Generate Printable Paper Versions** with corresponding answer keys.  
* **Profile Management:** Manage their own profile; restricted from altering their assigned role.

#### **C. Student: Personalized Learning Journey**

* **Assessment Experience:**  
  * Select a preferred language (English, Urdu, Arabic, or Persian) for localization.  
  * Interface automatically switches layout (Left-to-Right / Right-to-Left).  
  * Take a unique, timed assessment generated in real-time by the AI.  
* **Intelligent and Explainable Feedback (XAI):**  
  * Receive an instant, automated report (score, submitted answer, correct answer).  
  * View **Contextual Justification** for correct answers, pulled directly from the source material.  
  * Request deeper **AI-Generated Explanations** for misunderstood concepts.  
  * Receive a **Personalized Study Guide** from the AI to target improvement areas.  
* **Performance Tracking:** Access a complete history of past assessments.  
* **Profile Management:** Manage their own profile; restricted from changing their assigned role.

### **IV. Technical and Design Principles**

* **Software Architecture:** Strictly follows **SOLID** and the **Single Responsibility Principle (SRP)**.  
  * Ensures the codebase is modular, maintainable, and scalable.  
* **UI/UX Design:** Built on modern best practices:  
  * Prioritizing intuitive navigation, accessibility, and clarity.  
* **Responsiveness:** Adheres to a **Mobile-First Responsive Policy** for a seamless experience across all devices.

**Physical paper Construction:**

1)Pop up appear when physical paper request generate

a)Institute Name

b)Teacher Name

c)Subject Name

d)Paper Date

e)Paper Time

f)Paper Duration

g)Total marks

h)Notes

i)Page size(A4/A5/Letter) take input from user

Key Points:

.)Questions must be in bold format

.)option normal

.)Header font bigger(take input from user to adjust accordingly normal or heading font size)

.)Add customization asking from user at the time of generation (pdf/docs)


**Feedback Form:**

Ratings

Suggestion

Problem faced

Alphabet count check (on resource)

Captcha add at the time of signup

Super admin security

 

