---
tags:
  - 개인프로젝트
  - 데이터수집
  - 데이터분석
---
github: https://github.com/jdk829355/jd_to_vec_collection
![[Pasted image 20260613010332.png]]
IT 채용공고에서 요구 기술과 직무명의 관계를 분석하기 위하여 채용공고 크롤링을 실시했습니다. 

1. url 목록은 점핏의 sitemap에서 가져왔습니다. 
2. url 목록을 배치로 나누어 처리했습니다. 
3. 동시에 크롤링을 많이하는 것을 방지하고자 batch 간 실행 간격을 조절하였습니다. 
4. db 처리 효율성을 위하여 배치 단위로 insert를 진행했습니다. 
5. 해당 수집 로직을 prefect cloud에 배포하여 자동화 하였습니다. 