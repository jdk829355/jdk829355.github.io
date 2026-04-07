---
tags:
  - 2026세모톤
  - 팀프로젝트
---
github: https://github.com/todo-with/todowith
![[Pasted image 20260406004716.png]]
![[Pasted image 20260406004741.png]]
![[Pasted image 20260406004745.png]]
![[Pasted image 20260406004750.png]]
![[Pasted image 20260406004755.png]]
![[Pasted image 20260406004800.png]]
![[Pasted image 20260406004805.png]]
![[Pasted image 20260406004810.png]]
![[Pasted image 20260406004814.png]]
서로 배우고싶은 취미를 기반으로 1:1 멘토링을 매칭시켜주는 서비스입니다!
### 기능
1. 사용자가 배우길 원하는 기술과 가르칠 수 있는 기술 등록 및 수정
2. 교환을 원하는 사람이 올리는 공고 등록/수정
3. 개인이 등록한 기술을 바탕으로 공고 추천
4. 채팅 기능 및 매칭 신청 수락 기능
5. 채팅으로 todo 생성 기능
### 기술 스택
- Frontend: Next.js
- Backend: **FastAPI**
- Db: **PostgreSQL (pgvector)**
- Deployment: **Docker Compose**, EC2
- AI: OpenAI API, **Huggingface API** (for vector embedding)
- MessageQueue: **Redis PubSub**
### 참고
[유튜브 영상](https://youtu.be/fm6EeuBX_r4)
[자세한 회고](https://jungdaegyun.notion.site/ToDoWith-3391ce939b9580f19e96e0bb8fa08f4e?source=copy_link)