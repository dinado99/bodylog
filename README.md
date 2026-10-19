# bodylog
개인용 다이어트 기록장

## 구조
```
bodylog/
├── goals.md              # 목표 체중, 기간, 다짐
├── data/
│   └── weight.csv        # 날짜별 체중·체지방 기록
├── records/
│   └── YYYY/MM/          # 일별 기록 (YYYY-MM-DD.md)
└── templates/
    ├── daily.md          # 일일 기록 템플릿
    └── weekly.md         # 주간 회고 템플릿
```

## 사용법
1. `goals.md`에 목표를 적어요.
2. 매일 `templates/daily.md`를 복사해서 `records/YYYY/MM/YYYY-MM-DD.md`로 저장해요.
3. 아침 체중은 `data/weight.csv`에 한 줄씩 추가해요.
4. 일주일마다 `templates/weekly.md`로 회고를 남겨요.
