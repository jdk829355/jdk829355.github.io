---
tags:
  - 개인프로젝트
  - 25-2-FSSP-Project
---
github: https://github.com/jdk829355/Inforest
![[Pasted image 20260320012703.png]]
![[Pasted image 20260320012503.png]]
![[Pasted image 20260320012510.png]]
![[Pasted image 20260320012521.png]]
웹사이트를 스크랩하여 AI 요약을 보고 메모를 적을 수 있는 서비스입니다.
- gRPC 기반 클라이언트-서버 통신 구조와 백엔드 아키텍처 설계
- CRUD, AI 작업 요청, Streaming 기반 결과 전달 흐름 구현
- Redis에 AI 작업 진행 상태를 저장하여 중복 요청을 방지하고 재접속 상황 처리
- gRPC Streaming을 활용해 AI 작업 완료 시 클라이언트가 결과를 즉시 확인할 수 있도록 설계
### 참고
[유튜브 영상](https://youtu.be/IvbV9t1wWMs)
[자세한 회고](https://jungdaegyun.notion.site/InForest-3391ce939b958049bffbe1c1a352ce1b?source=copy_link)
