Abstract
GynoVision AI Suite is a full-stack, multimodal clinical decision support system focused on gynecological cancers, specifically uterine (endometrial) and cervical cancer. The system integrates heterogeneous data sources and AI paradigms—classical machine learning on clinical variables, ensemble learning on TCGA molecular data, and deep learning for Pap smear cytology image analysis—into a unified web platform.

The suite comprises four AI modules: (1) uterine cancer clinical risk prediction, (2) uterine cancer molecular prognostics using TCGA-derived features, (3) cervical cancer clinical risk stratification, and (4) cervical cytology image classification using a ResNet-50 convolutional neural network. Each module exposes a RESTful Flask microservice, while a modern React + TypeScript frontend provides an interactive user interface with integrated PDF report generation and model explainability (SHAP and Grad-CAM).

This project demonstrates how AI can be used as a clinical decision support tool rather than an autonomous diagnostic system. It emphasizes interpretability, risk stratification, and reportability. The prototype is intended strictly for academic and educational use and has not been clinically validated.

Keywords: Clinical Decision Support System, Gynecological Cancer, Uterine Cancer, Cervical Cancer, Machine Learning, Deep Learning, SHAP, Grad-CAM, TCGA.

1. Introduction
1.1 Background and Motivation
Gynecological cancers, including uterine (endometrial) and cervical cancer, represent a significant cause of morbidity and mortality in women worldwide. Early detection, accurate risk stratification, and appropriate follow‑up are critical for improving patient outcomes. Traditionally, clinicians rely on a combination of risk factors, imaging, histopathology, and cytology to make decisions, which can be time‑consuming and subject to inter‑observer variability.

Recent advances in machine learning and deep learning have enabled the development of clinical decision support systems (CDSS) capable of processing structured clinical data, genomic markers, and medical images. However, many existing tools focus on a single modality or cancer type and often lack transparency and explainability, making them difficult to trust and adopt in practice.

1.2 Problem Statement
There is a need for an integrated, explainable, and user‑friendly AI platform that can assist clinicians in assessing gynecological cancer risk using multiple data modalities:

Clinical risk factors (demographics, symptoms, comorbidities, reproductive history)
Molecular/genomic features and survival information (e.g., TCGA-UCEC data)
Cytology images from Pap smear slides
The problem is to design and implement a multimodal AI system that:

Provides risk predictions and classifications for both uterine and cervical cancers
Offers model explainability to support clinical interpretation
Presents results in an intuitive, web-based interface suitable for a clinical decision support scenario
1.3 Objectives
The main objectives of the project are:

Objective 1: Design and develop a full-stack web application for gynecological cancer decision support.
Objective 2: Implement clinical risk prediction models for uterine and cervical cancer using machine learning.
Objective 3: Implement molecular prognostic models for uterine cancer using TCGA-based features and ensemble methods.
Objective 4: Implement a deep learning-based cervical cytology image classifier using a ResNet-50 backbone.
Objective 5: Integrate explainability methods such as SHAP and Grad-CAM to provide transparent model outputs.
Objective 6: Provide downloadable, structured PDF reports summarizing inputs, predictions, and recommendations.
Objective 7: Containerize the system using Docker for easy deployment of the frontend and all backend services.
1.4 Scope of the Project
The project is a research prototype and focuses on:

Risk prediction and classification (not full clinical workflow automation)
Proof-of-concept integration of multiple AI modules into a single platform
Academic evaluation and demonstration, not clinical validation or regulatory approval
2. Literature Review (Brief)
(You should extend this section with papers you actually cited in your thesis.)

2.1 Clinical Decision Support Systems (CDSS)
Overview of CDSS for oncology and how risk calculators and prognostic models support clinical decisions.
Discussion of challenges: data quality, generalizability, explainability, and clinician trust.
2.2 Machine Learning in Gynecological Cancer
Use of logistic regression, tree-based models, and gradient boosting for risk prediction using clinical risk factors.
Examples of models for uterine and cervical cancer risk stratification in literature.
2.3 Deep Learning for Cytology and Histopathology
Application of convolutional neural networks (CNNs), e.g., ResNet, for image-based classification of Pap smear slides.
Importance of interpretability techniques like Grad-CAM in medical imaging.
2.4 Explainable AI (XAI) in Healthcare
SHAP (SHapley Additive exPlanations) for feature-level contributions in tabular models.
Grad-CAM for visual explanations in image-based models.
Need for transparent AI due to regulatory and ethical concerns.
3. System Overview
3.1 High-Level Description
GynoVision AI Suite is an AI-powered multimodal clinical decision support platform targeted at gynecological cancer assessment. It unifies four AI modules:

Uterine Cancer Clinical Prediction
Uterine Cancer Molecular (TCGA) Prognostics
Cervical Cancer Clinical Prediction
Cervical Cytology Image Classification
The frontend is implemented using React (TypeScript) with a modern, dark, glassmorphic UI, while each AI model runs in its own Flask microservice. The frontend communicates with the backends via RESTful APIs and supports PDF report generation, risk visualization, SHAP-based explanations, and Grad-CAM overlays.

3.2 Functional Requirements
Accept clinical input data through structured web forms.
Accept Pap smear cytology images for classification.
Validate input data on the client side.
Query backend microservices to obtain predictions and explanations.
Visualize risk tiers, probabilities, and SHAP explanations.
Generate and download PDF reports summarizing each case.
Provide disclaimers clarifying that the system is for academic and research use only.
3.3 Non-Functional Requirements
Usability: Intuitive, responsive UI with clear layout and guidance.
Performance: Low-latency inference for clinical and imaging modules.
Scalability: Microservice-based architecture allowing independent deployment and scaling of modules.
Maintainability: Modular codebase segregating frontend, backends, and model artifacts.
Security (basic level): No patient-identifiable data storage (stateless prediction only).
4. System Architecture
4.1 Overall Architecture
The system follows a decoupled frontend-backend architecture:

Frontend: React + TypeScript application built with Vite, served via Nginx in production.
Backends: Four independent Flask-based microservices:
Uterine clinical model (Logistic Regression) — port 5007
Uterine TCGA molecular model (Random Forest + XGBoost) — port 5008
Cervical cytology imaging model (FastAI ResNet-50) — port 5009
Cervical clinical model (Calibrated LightGBM) — port 5010
Containerization: Docker and docker-compose.yml orchestrate all services and a shared network.
4.2 Module-Level Architecture
Frontend (src/):
pages/: Views for each module (UterineClinical, UterineMolecular, CervicalClinical, CervicalCytology, Index, About, NotFound).
components/: Shared UI components (navbar, footer, cards, animations, risk badges, confidence bars, image upload, recommendations).
utils/: PDF report generators for each module.
hooks/: Custom hooks for mobile detection and toast notifications.
ui/: Shadcn-based UI primitives (inputs, forms, dialogs, charts, etc.).
Backends (backend/):
uterine-cancer-model/: Logistic Regression model and associated Flask API (app.py).
uterine-cancer-TCGA-model/: Random Forest + XGBoost models with SHAP explainability.
cervical-cancer-resnet50-model/: FastAI ResNet-50 model server (model_server.py) for image classification + Grad-CAM.
cervical-cancer-clinical-model/: Calibrated LightGBM model and preprocessing pipeline.
5. Detailed Module Description
5.1 Module 1 — Uterine Cancer Clinical Prediction
Frontend Route: /uterine-clinical
Backend Service: backend/uterine-cancer-model/app.py (Port 5007)
Model: Logistic Regression (with class weighting)
Input Features (18 clinical parameters):
Demographics: Age, BMI, Menopause Status
Symptoms: Abnormal Bleeding, Pelvic Pain, Vaginal Discharge, Unexplained Weight Loss
Clinical Measurements: Endometrial Thickness (mm), CA-125 Level (U/mL)
Medical History: Hypertension, Diabetes, Family History of Cancer, Smoking, Estrogen Therapy
Pathology & Reproductive: Histology Type, Parity, Gravidity, Hormone Receptor Status
Outputs:
Probability score (0–100%)
Risk tier: Low / Intermediate / High (based on calibrated thresholds)
Top 5 feature contributions (coefficient-based, analogous to SHAP)
Rule-based clinical recommendations considering risk factors and measurements
5.2 Module 2 — Uterine Cancer Molecular (TCGA)
Frontend Route: /uterine-molecular
Backend Service: backend/uterine-cancer-TCGA-model/app.py (Port 5008)
Models:
Random Forest for molecular subtype classification (Task A)
XGBoost for survival outcome prediction (Task B)
Input Features (6 genomic + clinical):
Mutation Count
Fraction Genome Altered
MSI MANTIS Score
MSIsensor Score
Diagnosis Age
Race / Ethnicity (one-hot encoded)
Pipeline:
One-hot encoding of categorical race
Missing value imputation and feature scaling
PCA of MSI markers (MANTIS + MSIsensor) into MSI_PC1
Outputs:
Molecular subtype with confidence and class probabilities
Survival risk: Living / Deceased with probability and risk tier
SHAP-based feature importance for interpretability
5.3 Module 3 — Cervical Cancer Clinical Prediction
Frontend Route: /cervical-clinical
Backend Service: backend/cervical-cancer-clinical-model/app.py (Port 5010)
Model: Calibrated LightGBM (CalibratedClassifierCV)
Input Features (28 clinical parameters):
Demographics & Lifestyle: Age, Number of Sexual Partners, Age at First Intercourse, Pregnancies, Smoking status/duration/intensity
Contraception & IUD: Hormonal contraceptive usage and duration, IUD usage and duration
STD History: Multiple specific STD types (HIV, HPV, Hepatitis B, AIDS, etc.), counts, and timing
Custom Preprocessing Transformers:
STDAtomicTransformer: Imputation and engineering of summary features (Any_STD, STD_Burden, High_Risk_STD)
MissingnessIndicatorTransformer: Binary missing indicators
GeneralImputerTransformer: Median/mode imputation
ColumnNameSanitizer: Normalizes column names
RobustScalerTransformer: Scales numeric features
Outputs:
Cancer probability with dual-threshold risk classification (T1, T2)
Risk label: Low / Moderate / High
SHAP-based explanation of top contributing risk factors
Clinical decision support text based on derived risk
5.4 Module 4 — Cervical Cytology Image Classification
Frontend Route: /cervical-cytology
Backend Service: backend/cervical-cancer-resnet50-model/model_server.py (Port 5009)
Model: FastAI ResNet-50 CNN (pre-trained and fine-tuned)
Classes:
Dyskeratotic
Koilocytotic
Metaplastic
Parabasal
Superficial-Intermediate
Input:
Pap smear cytology image file (.jpg, .jpeg, .png, .bmp, .tif, .tiff)
Outputs:
Predicted cell type
Confidence score and per-class probability distribution
Grad-CAM heatmap overlay highlighting the most influential regions
Recommendation text linked to the predicted cell type
6. Datasets
6.1 Summary of Datasets Used
Dataset	Cancer Type	Usage
TCGA-UCEC	Uterine (Endometrial)	Molecular subtype classification and survival analysis
SipakMed	Cervical	Pap smear cytology image classification
Clinical Registry Data	Cervical	Clinical risk factor-based cervical cancer model
Synthetic Clinical Data	Uterine	Clinical risk prediction model training
(In your full report, you should describe preprocessing steps, dataset sizes, and ethical considerations in more detail.)

7. Methodology
7.1 Data Preprocessing
Handling of missing values using tailored imputation strategies.
Encoding of categorical variables (one-hot encoding for race, etc.).
Feature scaling using robust scaling for numeric variables.
Image normalization and resizing for ResNet-50 pipeline.
Creation of engineered features, e.g., STD burden, high-risk STD flags.
7.2 Model Training (High-Level)
(Training code may not be in the repo, but you can describe the approach.)

Logistic Regression with class weighting for uterine clinical risk.
Tree-based models (Random Forest, LightGBM, XGBoost) for clinical and molecular tasks with hyperparameter tuning.
Transfer learning of ResNet-50 for cytology images—using pre-trained weights, fine-tuning on Pap smear images, and applying data augmentation.
7.3 Evaluation Metrics
(You should fill in your actual results if you have them.)

Typical metrics to report:

Accuracy, Precision, Recall, F1-score
ROC-AUC for binary risk prediction
Confusion matrices for multiclass cytology classification
Calibration plots (optional) for risk scores
Add a subsection like:

7.3.1 Experimental Results

Uterine Clinical Model: AUC = [your value], Accuracy = [your value], etc.
Uterine TCGA Model: AUC for subtype classification, survival prediction metrics.
Cervical Clinical Model: AUC, F1-score, etc.
Cytology Model: Overall accuracy and class-wise performance.
8. Implementation
8.1 Frontend Implementation
Developed using React 18 with TypeScript and Vite.
UI styled with TailwindCSS and Shadcn UI components.
Animations and visual effects implemented using Framer Motion (ParticleField, DNAHelix, glassmorphic GlassCard).
Client-side form validation and schema validation via Zod.
Data fetching and caching via TanStack Query (React Query).
PDF report generation with jsPDF, implemented in:
generateUterineReport.ts
generateMolecularReport.ts
generateCervicalReport.ts
generateCervicalClinicalReport.ts
8.2 Backend Implementation
Each microservice is a Flask app with:
/health endpoint for readiness checks.
/model-info (where applicable) for model metadata.
/predict/... endpoint for prediction requests.
Model artifacts are stored in dedicated directories (models/, model_artifacts/) and loaded at startup using joblib or model-specific loaders.
SHAP is integrated for tabular models; Grad-CAM is implemented in the ResNet-50 model server.
Cross-Origin Resource Sharing handled via Flask-CORS.
8.3 Deployment and Containerization
docker-compose.yml orchestrates:
Frontend (served by Nginx)
Uterine clinical microservice
Uterine TCGA microservice
Cervical clinical microservice
Cervical cytology microservice
Healthchecks configured for each backend service to ensure the frontend depends only on healthy backends.
start.bat and start.sh convenience scripts for platform-specific startup.
9. Explainability & Interpretability
9.1 SHAP Explanations
Tree-based models (Random Forest, LightGBM, XGBoost) use TreeExplainer.
Logistic Regression model uses coefficient-based feature contribution approximations.
For each prediction:
Top contributing features are listed with their direction (risk-increasing or risk-decreasing).
Visual risk badges and confidence bars communicate risk levels intuitively.
9.2 Grad-CAM for Cytology
Grad-CAM is applied to the last convolutional block (layer4) of ResNet-50.
Generated heatmaps are overlaid on the original image to show areas that most influenced the prediction.
This supports pathologists by making the CNN’s reasoning more transparent.
9.3 Clinical Decision Support Layer
Rule-based engines that map model outputs and feature combinations to human-readable recommendations, e.g.:
More frequent follow-up
Recommendation for further diagnostic tests
Reminder that results must be interpreted by qualified clinicians
10. Results and Discussion
(Customize based on your experiments.)

10.1 Quantitative Results
Present tables/graphs with:
Performance of each model on test/validation sets.
Comparisons between baseline models and final models.
10.2 Qualitative Analysis
Example cases where:
SHAP highlighted clinically sensible risk factors.
Grad-CAM focused on diagnostically relevant cell regions.
UI and user experience feedback (if you did a small user evaluation).
10.3 Discussion
Interpretation of results: where the models perform well and where they may struggle.
Impact of data quality, class imbalance, and synthetic data on performance.
Limitations in terms of generalizability and bias.
11. Limitations
Models trained partly on synthetic or limited datasets; may not generalize to all populations.
No integration with electronic health record (EHR) systems.
Prototype-level security and privacy; not suitable for real patient deployment.
No external clinical validation or regulatory approval.
Explainability methods (SHAP, Grad-CAM) are approximations and depend on background data and architecture.
12. Future Work
Extend to additional gynecological cancers and biomarkers.
Incorporate larger, multi-center clinical datasets for better generalization.
Integrate with hospital information systems / EHR for real-world workflows.
Add calibration improvements and uncertainty estimation.
Perform user studies with clinicians to evaluate usability and clinical utility.
Explore active learning and continual learning for model updates.
13. Conclusion
GynoVision AI Suite demonstrates how multiple AI paradigms—classical machine learning, ensemble methods, and deep learning—can be combined into a unified clinical decision support platform for gynecological cancers. By integrating clinical, molecular, and imaging data, the system provides risk estimates, prognostic information, and visual explanations that can support (but not replace) clinician judgment.

The project successfully implements four modular AI services, a modern web-based frontend, and supporting infrastructure for report generation and containerized deployment. While the prototype is not ready for clinical use, it serves as a comprehensive final-year project that showcases end-to-end design, implementation, and deployment of an explainable AI system in healthcare.