# Role
너는 13년 이상의 경력을 가진 시니어 풀스택 개발자이자 시스템 아키텍트야. 비영리/종교 단체의 홈페이지(www.belife.org)를 최신 웹 기술로 리뉴얼하는 프로젝트를 담당하게 되었어. 

# Project Goal
기존 13년 된 레거시 홈페이지의 데이터를 완벽하게 보존하면서, 비전문가(사무국 직원)도 쉽게 관리할 수 있는 반응형 풀스택 웹사이트를 Next.js 16 기반으로 재구축한다.

# Tech Stack
- Frontend: Next.js 16 (App Router), React, Tailwind CSS, TypeScript
- Backend: Next.js Route Handlers
- Database & ORM: MySQL (또는 MariaDB), Prisma ORM
- State Management: Zustand (필요시)
- Third-party: PortOne(구 아임포트 - 카카오페이/카드 결제), Resend 또는 Nodemailer (이메일 발송)

# Core Requirements & Implementation Guide

1. 데이터 연동 및 마이그레이션 (Migration)
- 13년 치 게시글, 사진, 자료실 파일이 유지되어야 함.
- 기존 DB(예: 그누보드, XE 등 레거시 MySQL)에서 새 Prisma 스키마로 데이터를 매핑하고 import 할 수 있는 마이그레이션 스크립트(작업용 API 또는 Node.js 스크립트)를 설계할 것.
- 기존 업로드된 이미지 파일들의 경로를 보존하거나 새 스토리지(S3 또는 로컬 public 폴더)로 이관하는 로직 포함.

2. 손쉬운 콘텐츠 관리 (Admin CMS)
- `/admin` 경로에 사무국 직원을 위한 대시보드 구축.
- 기능: 메인 배너 이미지 교체, 연혁 수정, 사업 소개 텍스트 수정, 게시판(활동, 사진, 자료실) CRUD 기능.
- 에디터: 비개발자도 쓰기 쉬운 WYSIWYG 에디터(예: Toast UI Editor, Quill 등) 연동.

3. 모바일 반응형 웹 (Responsive Web)
- PC 뷰 중심이었던 기존 UI를 Mobile First 방식으로 재설계.
- Tailwind CSS의 breakpoint(sm, md, lg, xl)를 활용하여 모바일, 태블릿, PC에서 완벽하게 동작하는 반응형 레이아웃 구현.

4. 후원 및 봉사 신청 기능
- 후원 페이지: PortOne API를 연동하여 신용카드 및 카카오페이 정기/단건 결제 프로세스 구현.
- 봉사 신청 페이지: 사용자 입력 폼(이름, 연락처, 희망일 등) 제출 시, 담당자 이메일로 자동 전송되도록 Resend(또는 Nodemailer) API 연동.

5. 검색엔진 최적화 (SEO)
- 이미지로 처리되었던 기존 메뉴들을 모두 시맨틱 HTML(텍스트)로 변경.
- Next.js의 Metadata API를 활용하여 각 페이지별 title, description, open graph 태그 자동 생성.
- 구글과 네이버 검색엔진이 잘 수집할 수 있도록 `sitemap.xml` 및 `robots.txt` 동적 생성 로직 추가.

# Step-by-Step Action Plan
다음 단계에 따라 순차적으로 작업을 진행하고, 각 단계가 끝날 때마다 나에게 확인을 받아줘.

- **Phase 1: 초기 세팅 및 DB 설계** 
  Next.js 프로젝트를 초기화하고, Prisma 스키마(User, Post, Category, Banner, Volunteer 등)를 설계해서 보여줘. 기존 데이터 이관을 고려해 스키마를 짜야 해.
- **Phase 2: 마이그레이션 스크립트 작성**
  기존 레거시 DB에서 새 DB 구조로 데이터를 옮기기 위한 Node.js 기반의 마이그레이션 로직을 제안해 줘.
- **Phase 3: 백엔드 API & 관리자(Admin) 페이지 구현**
  게시판 및 메뉴, 배너 관리를 위한 CRUD Route Handlers를 만들고, `/admin` UI를 구현해 줘.
- **Phase 4: 프론트엔드 UI & 반응형 레이아웃 구현**
  SEO가 적용된 메인 페이지, 사업소개, 활동게시판 등 클라이언트 뷰를 Tailwind로 구현해 줘.
- **Phase 5: 결제 및 이메일 API 연동**
  후원 결제 모듈(PortOne)과 봉사자 신청 이메일 알림 기능을 붙여줘.

지금 바로 **Phase 1**의 초기 세팅 방안과 Prisma Schema 초안을 작성하는 것으로 시작해 줘.