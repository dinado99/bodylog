# bodylog
개인용 다이어트 기록장. 정적 페이지(GitHub Pages) + Supabase(인증/DB).

## 구조
```
index.html / style.css / app.js   # 프론트엔드 (빌드 불필요)
config.js                         # Supabase URL / anon key
supabase/schema.sql               # 테이블 + RLS 정책
data/, records/, templates/       # 수기 기록용 마크다운 템플릿
```

## 설정
1. [supabase.com](https://supabase.com)에서 프로젝트를 만들어요.
2. SQL Editor에서 `supabase/schema.sql` 전체를 실행해요.
3. Project Settings > API 에서 **Project URL**과 **anon public key**를 복사해 `config.js`에 넣어요.
   (anon key는 공개되어도 되지만, `service_role` 키는 절대 커밋하지 마세요.)
4. Authentication > URL Configuration의 **Site URL**에 Pages 주소(`https://<유저명>.github.io/bodylog/`)를 넣어요.
   혼자 쓸 거면 Authentication > Providers > Email의 "Confirm email"을 꺼두면 가입 즉시 로그인돼요.
5. GitHub 레포 Settings > Pages 에서 Source를 `Deploy from a branch`, Branch를 `main` / `/ (root)`로 설정해요.

로컬 확인: `python3 -m http.server` 후 http://localhost:8000
