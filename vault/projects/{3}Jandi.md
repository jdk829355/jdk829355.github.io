---
tags:
  - 팀프로젝트
  - 진행중
---
github: https://github.com/JandiProject
![[Pasted image 20260319230639.png]]
![[Pasted image 20260320011332.png]]
![[Pasted image 20260320011340.png]]
![[Pasted image 20260320011347.png]]
![[Pasted image 20260320011351.png]]
![[Pasted image 20260320011356.png]]
![[Pasted image 20260320011406.png]]
![[Pasted image 20260320011412.png]]
![[Pasted image 20260320011433.png]]
![[Pasted image 20260320011446.png]]
![[Pasted image 20260320011450.png]]
![[Pasted image 20260320011503.png]]
![[Pasted image 20260320011510.png]]
블로그의 글을 잔디밭으로 보여주고 주제 분석을 하여 사용자의 블로그 작성을 시각화하는 서비스입니다.
- ERD 작성 및 백엔드 아키텍처를 구상하며 데이터 수집, 집계, 위젯 제공 흐름 설계
- Prefect 기반 Batch Job을 구성하여 기업 기술 블로그 데이터를 주기적으로 수집
- 집계 결과를 Materialized View로 분리하여 잔디밭 데이터를 효율적으로 제공 및 DB 부하 감소
- 공개 위젯에서 임의의 `user_id`로 타인의 잔디밭을 생성하는 문제를 방지하기 위해, 위젯 전용 secret과 JWT 기반 식별 방식을 적용

### 참고
[유튜브 영상](https://youtu.be/Vpuh3lf-NF4)
[자세한 회고](https://jungdaegyun.notion.site/Jandi-3391ce939b9580548485d12d270839e4?source=copy_link)