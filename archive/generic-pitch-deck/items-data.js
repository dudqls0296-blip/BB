/**
 * 발표용 홈페이지 데이터 설정 파일 (items-data.js)
 * 
 * 💡 사용 방법:
 * 사용자가 아이템 정보나 발표 내용을 알려주면 이 파일의 내용을 수정하거나 추가하면
 * 웹사이트와 발표 슬라이드에 즉시 자동 반영됩니다!
 */

const PRESENTATION_DATA = {
    // 1. 발표 기본 정보
    meta: {
        badge: "2026 데모데이 & 사업 계획 발표",
        title: "차세대 혁신 솔루션 발표",
        subtitle: "아이템을 통해 만들어가는 새로운 패러다임과 비즈니스 가치",
        presenter: {
            name: "발표자 성명",
            role: "대표 / 프로젝트 총괄",
            affiliation: "혁신 프로젝트 팀",
            date: "2026년 10월",
            contact: "contact@example.com"
        },
        pitchDurationMinutes: 10 // 발표 목표 시간 (분)
    },

    // 2. 문제 제기 (배경 및 문제점)
    problems: [
        {
            tag: "Problem 01",
            icon: "alert-circle",
            title: "기존 방식의 높은 비효율성",
            desc: "전통적인 프로세스로 인해 불필요한 리소스 낭비와 긴 소요 시간이 발생하고 있습니다.",
            stat: "85%",
            statLabel: "업계 평균 불만족 비율"
        },
        {
            tag: "Problem 02",
            icon: "clock",
            title: "고객 니즈의 빠른 변화",
            desc: "소비자들의 요구는 다변화되고 있으나, 기존 솔루션은 유연한 대처가 어렵습니다.",
            stat: "3.2x",
            statLabel: "변화 주기 가속도"
        },
        {
            tag: "Problem 03",
            icon: "trending-down",
            title: "높은 비용과 진입 장벽",
            desc: "도입 및 유지 비용의 부담으로 대다수 중견/스타트업의 접근성이 현저히 낮습니다.",
            stat: "64%",
            statLabel: "예산 부담으로 포기"
        }
    ],

    // 3. 솔루션 (우리의 해결책)
    solution: {
        headline: "직관적이고 즉각적인 혁신 솔루션",
        subheadline: "기술적 우위와 사용자 중심 설계를 통해 기존 한계를 돌파합니다.",
        points: [
            {
                title: "즉각적인 실행력",
                desc: "별도 복잡한 설정 없이 원클릭으로 바로 도입 가능한 고효율 시스템",
                icon: "zap"
            },
            {
                title: "비용 절감 70%",
                desc: "효율적인 아키텍처를 통해 불필요한 운영비를 획기적으로 절약",
                icon: "dollar-sign"
            },
            {
                title: "완벽한 확장성",
                desc: "다양한 도메인과 신규 아이템에 유연하게 대응하는 모듈형 구조",
                icon: "layers"
            }
        ]
    },

    // 4. 🔥 핵심 아이템 목록 (사용자가 아이템을 알려주시면 여기에 채워집니다!)
    items: [
        {
            id: "item-1",
            category: "핵심 아이템",
            badge: "Main Product",
            name: "스마트 핵심 아이템 #1",
            oneLiner: "직관적인 인터페이스와 즉각적인 피드백을 제공하는 주력 제품",
            description: "사용자가 전달해주실 아이템의 상세 내용, 개발 배경, 핵심 강점이 들어갈 공간입니다. 디자인과 레이아웃이 미리 완성되어 있어 텍스트만 교체하면 즉시 고퀄리티 슬라이드로 변환됩니다.",
            icon: "sparkles",
            highlights: [
                "특징 1: 직관적인 사용자 경험 및 쉬운 사용성",
                "특징 2: 기존 솔루션 대비 2배 빠른 처리 성능",
                "특징 3: 고객 맞춤형 커스터마이징 지원"
            ],
            metrics: { label: "기대 생산성", value: "+140%" },
            speakerNote: "이 슬라이드에서는 주력 아이템의 가장 큰 차별점과 사용자 혜택을 강조하세요."
        },
        {
            id: "item-2",
            category: "연계 솔루션",
            badge: "Solution",
            name: "확장형 연계 아이템 #2",
            oneLiner: "아이템 #1과의 시너지를 극대화하는 보조 서비스",
            description: "함께 발표할 두 번째 아이템이나 기능의 상세 정보가 들어갑니다. 이미지나 구체적인 사양, 기능 목록을 손쉽게 연결할 수 있습니다.",
            icon: "shield-check",
            highlights: [
                "특징 1: 강력한 보안성과 안정적인 운영",
                "특징 2: 클라우드 기반 실시간 동기화 지원",
                "특징 3: 다양한 서드파티 툴과의 원활한 연동"
            ],
            metrics: { label: "운영 비용 절감", value: "-60%" },
            speakerNote: "보조 아이템의 연계 시너지와 안정성을 중점적으로 어필합니다."
        },
        {
            id: "item-3",
            category: "플랫폼 / 인프라",
            badge: "Platform",
            name: "차세대 플랫폼 아이템 #3",
            oneLiner: "생태계를 확장하고 장기적 경쟁 우위를 만드는 플랫폼",
            description: "장기 비전이나 플랫폼형 아이템, 또는 서비스 모델을 설명하는 영역입니다. 발표의 신뢰성과 성장 가능성을 심어줍니다.",
            icon: "cpu",
            highlights: [
                "특징 1: 대규모 트래픽 처리 가능한 확장형 구조",
                "특징 2: 자동화된 데이터 분석 및 대시보드",
                "특징 3: 글로벌 시장 진출 표준 규격 준수"
            ],
            metrics: { label: "처리 속도", value: "0.2s" },
            speakerNote: "장기적인 기술적 해자(Moat)와 시장 확장성을 강조합니다."
        }
    ],

    // 5. 시장 규모 및 성장성 (차트 및 지표)
    market: {
        headline: "거대한 시장 기회와 가파른 성장세",
        subheadline: "검증된 수요를 바탕으로 초기 시장을 빠르게 선점합니다.",
        stats: [
            { label: "TAM (전체 시장)", value: "12.5조 원", change: "+24% CAGR" },
            { label: "SAM (유효 시장)", value: "2.8조 원", change: "목표 타겟 군" },
            { label: "SOM (수익 시장)", value: "4,500억 원", change: "초기 3년 타겟" }
        ],
        chartData: {
            years: ["2024", "2025", "2026(E)", "2027(E)", "2028(E)"],
            marketSizes: [4.2, 5.8, 8.5, 12.0, 16.8] // 단위: 조 원
        }
    },

    // 6. 비즈니스 모델 & 로드맵
    business: {
        revenueModel: [
            { title: "B2B SaaS 구독 모델", desc: "월/연간 정기 결제를 통한 안정적인 MRR 확보", icon: "repeat" },
            { title: "엔터프라이즈 맞춤 구축", desc: "고객사 맞춤형 통합 및 고급 기능 패키지 판매", icon: "briefcase" },
            { title: "파트너십 & 거래 수수료", desc: "플랫폼 내 거래 및 연동 솔루션 생태계 수수료", icon: "share-2" }
        ],
        roadmap: [
            { phase: "Phase 1 (현재)", title: "MVP 검증 & 시범 서비스", date: "2026 Q1-Q2", status: "completed", desc: "핵심 아이템 개발 완료 및 베타 테스트 진행" },
            { phase: "Phase 2", title: "본격 서비스 런칭 & 초기 고객 확보", date: "2026 Q3-Q4", status: "current", desc: "타겟 고객 대상 마케팅 및 유료 전환 유도" },
            { phase: "Phase 3", title: "시장 점유율 확대 & 생태계 구축", date: "2027 Q1-Q4", status: "upcoming", desc: "연계 아이템 출시 및 파트너십 확장" },
            { phase: "Phase 4", title: "글로벌 시장 진출", date: "2028+", status: "upcoming", desc: "동아시아 및 북미 권역 진출" }
        ]
    },

    // 7. 팀 및 비전
    team: [
        { name: "홍길동", role: "CEO & Co-founder", exp: "전 IT 대기업 전략팀 / 10년 경력", icon: "user" },
        { name: "김철수", role: "CTO & Co-founder", exp: "클라우드 아키텍트 / AI 연구원 출신", icon: "code" },
        { name: "이영희", role: "Product Lead", exp: "다수 핀테크/플랫폼 서비스 기획 및 런칭", icon: "layout" }
    ],

    // 8. Q&A 및 마무리 문구
    closing: {
        title: "미래를 함께 열어갈 파트너를 찾습니다",
        subtitle: "경청해 주셔서 감사합니다. 질문을 환영합니다.",
        callToAction: "IR 자료 요청 & 미팅 신청",
        contactEmail: "presentation@domain.com",
        contactPhone: "010-1234-5678"
    }
};
