import type { Topic } from '../types';

const topic: Topic = {
  key: "cs-7",
  name: "객체지향 · 설계",
  must: [
    "오버로딩은 같은 이름에 파라미터만 다른 메서드(컴파일 타임), 오버라이딩은 부모 메서드 재정의(런타임)다.",
    "불변 객체는 스레드 안전하고 동작을 예측하기 쉽다. 가능하면 불변으로 만든다.",
    "`a.getB().getC()`처럼 연쇄 호출이 길면 디미터 법칙 위반 신호다.",
    "테스트하기 어려운 코드는 결합도가 높다는 신호다."
  ],
  groups: [
    {
      name: "OOP 4대 특성",
      compare: {
        cols: ["기준", "캡슐화", "상속", "다형성", "추상화"],
        rows: [
          ["핵심 아이디어", "내부 숨기고 메서드로 공개", "부모 기능 물려받기", "같은 메시지, 다른 동작", "핵심 특징만 추출"],
          ["자바 수단", "`private` 필드, 접근 제어자", "`extends`", "오버라이딩, 인터페이스", "인터페이스, 추상 클래스"],
          ["얻는 것", "불변식 보호, 변경 국소화", "코드 재사용", "구현 교체 용이(OCP)", "복잡도 감소"],
          ["주의점", "getter/setter 남발", "부모와 강한 결합", "타입 분기(`instanceof`) 남용", "과도한 추상 계층"]
        ]
      },
      concepts: [
        {
          id: "cs/kaepsyulhwa",
          slug: "kaepsyulhwa",
          title: "캡슐화",
          deep: false,
          def: "데이터와 그 데이터를 다루는 기능을 객체 하나로 묶고, 내부 구현은 숨긴 채 공개된 메서드로만 상호작용하게 하는 것이다.",
          why: "외부 코드가 객체의 상태를 마음대로 바꾸면 불변 조건이 깨지고 변경 영향이 퍼지므로, 상태 변경을 객체 스스로 통제하게 하기 위해서다.",
          how: [
            "필드를 `private`으로 두고, 상태를 바꾸는 규칙은 객체 안의 메서드에 둔다.",
            "- 나쁜 예: `account.balance -= 1000` — 잔액 검증이 호출하는 쪽마다 흩어진다.",
            "- 좋은 예: `account.withdraw(1000)` — 잔액 부족 검증을 객체가 스스로 한다.",
            "내부 구현을 바꿔도 공개 메서드가 같으면 사용하는 쪽은 영향을 받지 않는다. 무분별한 getter·setter는 캡슐화를 깨므로 \"묻지 말고 시켜라(Tell, Don't Ask)\"를 따른다."
          ],
          use: [
            "계좌 잔액을 setter로 바꾸지 않고 withdraw 메서드 안에서 잔액 부족을 검증한다.",
            "엔티티의 컬렉션 필드는 getter로 그대로 내주지 않고 읽기 전용 뷰를 반환한다."
          ],
          myth: [
            [
              "필드를 private으로 하고 getter, setter를 만들면 캡슐화다",
              "모든 필드에 setter를 열어 두면 누구나 상태를 바꿀 수 있어 사실상 캡슐화가 깨진다. 의미 있는 행위 메서드를 제공해야 한다."
            ]
          ],
          answer: "캡슐화는 데이터와 그 데이터를 다루는 기능을 객체 하나로 묶고, 내부 구현은 숨긴 채 공개 메서드로만 상호작용하게 하는 것입니다. 상태를 바꾸는 규칙을 객체 안에 두므로 내부를 바꿔도 사용하는 쪽은 영향을 받지 않습니다.",
          analogy: "자동차 운전자는 엔진 구조를 몰라도 페달과 핸들만으로 운전할 수 있습니다.",
          followUps: [
            [
              "캡슐화를 지키면 무엇이 좋아지나요?",
              "상태 변경 규칙이 한 곳에 모여 잘못된 상태가 만들어지는 것을 막고, 내부 구현을 바꿔도 사용하는 코드를 고칠 필요가 없습니다. 변경의 영향 범위가 좁아집니다."
            ]
          ],
          related: ["cs/chusanghwa", "cs/dimiteo-beopchik"]
        },
        {
          id: "cs/sangsok",
          slug: "sangsok",
          title: "상속",
          deep: false,
          def: "기존 클래스의 필드와 메서드를 물려받아 새 클래스를 정의하는 것으로, is-a 관계를 표현한다.",
          why: "공통 코드를 상위 클래스에 두고 재사용하며 다형성을 쓰기 위해서지만, 강한 결합이라는 대가가 따른다는 점을 알기 위해서다.",
          how: [
            "`class Dog extends Animal`처럼 부모의 기능을 재사용하고 필요한 부분만 오버라이딩한다.",
            "- 장점: 코드 재사용, 계층 구조 표현, 다형성의 기반.",
            "- 단점: 부모의 내부 구현에 강하게 묶여 부모가 바뀌면 자식이 깨질 수 있다. 자바는 클래스 단일 상속만 허용한다.",
            "오버로딩(같은 이름, 다른 파라미터, 컴파일 타임 결정)과 오버라이딩(부모 메서드 재정의, 런타임 결정)을 구분한다."
          ],
          use: ["스프링의 OncePerRequestFilter를 상속해 요청당 한 번만 실행되는 필터를 만든다."],
          warn: ["재사용만을 위해 상속하지 않는다. 진짜 is-a 관계가 아니면 조합을 쓴다."],
          myth: [["코드를 재사용하려면 상속이 가장 좋다", "재사용만이 목적이면 조합이 결합도가 낮고 유연하다. 상속은 is-a 관계가 성립하고 부모가 확장용으로 설계됐을 때 쓴다."]],
          answer: "상속은 기존 클래스의 필드와 메서드를 물려받아 새 클래스를 정의하는 것으로 is-a 관계를 표현합니다. 코드 재사용과 다형성의 기반이 되지만, 부모 구현에 강하게 묶이는 단점이 있어 진짜 is-a 관계일 때만 씁니다.",
          followUps: [
            [
              "오버로딩과 오버라이딩의 차이는요?",
              "오버로딩은 같은 이름에 파라미터가 다른 메서드를 여러 개 정의하는 것으로 컴파일 시점에 결정됩니다. 오버라이딩은 부모 메서드를 자식이 재정의하는 것으로 런타임에 실제 객체 타입에 따라 결정됩니다."
            ]
          ],
          related: ["cs/sangsokboda-johap", "cs/dahyeongseong"]
        },
        {
          id: "cs/dahyeongseong",
          slug: "dahyeongseong",
          title: "다형성",
          deep: true,
          def: "같은 타입의 참조로 같은 메시지를 보내도 실제 객체에 따라 다르게 동작하는 성질이다.",
          why: "호출하는 쪽이 구체 클래스를 몰라도 되므로, 새 구현을 추가해도 기존 코드를 고치지 않는다. OCP와 DIP, 스프링의 DI가 모두 다형성 위에서 동작한다.",
          how: [
            "1) 인터페이스나 부모 타입으로 역할을 정의한다(`PaymentClient`).",
            "2) 여러 구현체가 각자 방식으로 메서드를 오버라이딩한다(`KakaoPayClient`, `TossPayClient`).",
            "3) 사용하는 쪽은 부모 타입 변수로 호출한다(`client.pay(...)`).",
            "4) 실제 어떤 메서드가 실행될지는 런타임에 객체의 실제 타입을 보고 결정된다(동적 바인딩).",
            "- 넓은 의미로는 오버로딩(같은 이름, 다른 파라미터)도 다형성에 포함하지만, 면접에서 다형성이라 하면 보통 오버라이딩을 통한 서브타입 다형성을 말한다."
          ],
          flow: ["인터페이스로 역할 정의", "구현체별 오버라이딩", "부모 타입으로 호출", "런타임에 실제 타입 확인", "해당 구현 메서드 실행"],
          code: "interface PaymentClient {\n    void pay(long amount);\n}\nclass KakaoPayClient implements PaymentClient {\n    public void pay(long amount) { /* 카카오페이 API 호출 */ }\n}\nclass TossPayClient implements PaymentClient {\n    public void pay(long amount) { /* 토스 API 호출 */ }\n}\n\nclass OrderService {\n    private final PaymentClient client;   // 구현체를 모른다\n    OrderService(PaymentClient client) { this.client = client; }\n    void order(long amount) { client.pay(amount); } // 런타임에 실제 구현이 실행됨\n}",
          codeLang: "java",
          use: ["결제 수단별 PaymentClient 구현체를 두고 서비스는 인터페이스로만 호출한다.", "테스트에서는 같은 인터페이스의 가짜 구현을 주입해 외부 API 없이 검증한다."],
          warn: [
            "`if (client instanceof KakaoPayClient)` 같은 타입 분기가 늘어나면 다형성을 제대로 쓰지 못하고 있다는 신호다.",
            "static 메서드와 private 메서드, 필드는 오버라이딩되지 않아 동적 바인딩 대상이 아니다."
          ],
          myth: [["다형성은 오버로딩을 말한다", "넓게는 포함되지만 객체지향에서 핵심은 오버라이딩과 동적 바인딩을 통한 서브타입 다형성이다."]],
          answer: "다형성은 같은 타입의 참조로 같은 메서드를 호출해도 실제 객체에 따라 다르게 동작하는 성질입니다. 호출하는 쪽은 인터페이스에만 의존하고 실제 실행 메서드는 런타임에 결정되므로, 새 구현을 추가해도 기존 코드를 고치지 않습니다. 스프링 DI가 이 성질을 이용합니다.",
          analogy: "리모컨의 재생 버튼은 같지만, 연결된 기기가 TV면 방송이, 스피커면 음악이 나옵니다.",
          qa: [
            "다형성을 예시로 설명해 주세요.",
            "같은 PaymentClient 타입으로 pay를 호출해도 실제 객체가 카카오페이 구현이면 카카오페이로, 토스 구현이면 토스로 결제되는 것이 다형성입니다. 호출하는 쪽은 인터페이스에만 의존하므로 새 결제 수단을 추가해도 서비스 코드는 바뀌지 않습니다. 스프링은 이런 구현체를 DI로 주입해 줍니다."
          ],
          followUps: [
            [
              "동적 바인딩이란 무엇인가요?",
              "호출할 메서드를 컴파일 시점이 아니라 런타임에 실제 객체의 타입을 보고 결정하는 것입니다. 그래서 부모 타입 변수로 호출해도 자식이 오버라이딩한 메서드가 실행됩니다."
            ],
            [
              "instanceof 분기가 많으면 무엇이 문제인가요?",
              "새 타입이 추가될 때마다 분기 코드를 찾아 고쳐야 해 OCP를 어깁니다. 타입별 동작을 각 클래스의 오버라이딩 메서드로 옮기면 분기가 사라집니다."
            ],
            [
              "static 메서드도 다형성이 적용되나요?",
              "적용되지 않습니다. static 메서드는 인스턴스가 아니라 클래스에 묶여 컴파일 시점에 결정되므로, 같은 시그니처를 정의해도 오버라이딩이 아니라 숨김(hiding)이 됩니다."
            ]
          ],
          related: ["cs/sangsok", "cs/ocp", "cs/dip", "cs/jeonryak-paeteon"]
        },
        {
          id: "cs/chusanghwa",
          slug: "chusanghwa",
          title: "추상화",
          deep: false,
          def: "복잡한 대상에서 공통적이고 핵심적인 특징만 뽑아내 단순한 개념으로 표현하는 것이다.",
          why: "구현 세부 사항까지 알아야 객체를 쓸 수 있다면 변경이 호출자에게 번지므로, 꼭 필요한 개념만 드러내 복잡도를 낮추기 위해서다.",
          how: [
            "자바에서는 인터페이스와 추상 클래스로 \"무엇을 하는가\"만 정의하고 \"어떻게 하는가\"는 구현체에 맡긴다.",
            "예: `OrderRepository`는 `save`, `findById`만 정의하고, JPA로 구현할지 JDBC로 구현할지는 감춘다.",
            "사용하는 쪽은 세부 구현을 몰라도 되므로 이해하기 쉽고, 구현을 바꿔도 영향을 받지 않는다."
          ],
          use: ["OrderRepository 인터페이스로 저장 기능을 추상화해 JPA와 메모리 구현을 바꿔 끼운다."],
          answer: "추상화는 복잡한 대상에서 핵심적인 공통 특징만 뽑아 단순한 개념으로 표현하는 것입니다. 자바에서는 인터페이스와 추상 클래스로 무엇을 하는지만 정의하고 어떻게 하는지는 구현체에 맡깁니다.",
          followUps: [
            [
              "추상화와 캡슐화는 어떻게 다른가요?",
              "추상화는 무엇을 드러낼지, 즉 핵심 개념을 정의하는 설계 관점이고, 캡슐화는 드러내지 않을 내부 구현을 숨기는 구현 관점입니다. 둘은 함께 쓰여 단순하고 안전한 인터페이스를 만듭니다."
            ]
          ],
          related: ["cs/kaepsyulhwa", "cs/inteopeiseu", "cs/chusang-keulraeseu"]
        }
      ]
    },
    {
      name: "SOLID",
      compare: {
        cols: ["개념", "핵심 질문", "위반 신호", "대표 해법"],
        rows: [
          ["SRP", "변경 이유가 하나인가", "한 클래스가 여러 팀 요구로 수정", "책임별 클래스 분리"],
          ["OCP", "수정 없이 확장되는가", "새 타입마다 if/switch 추가", "인터페이스 + 다형성"],
          ["LSP", "하위 타입이 대체 가능한가", "오버라이드에서 예외·규약 위반", "상속 대신 별도 타입"],
          ["ISP", "안 쓰는 메서드에 의존하나", "`UnsupportedOperationException` 구현", "역할별 인터페이스 분리"],
          ["DIP", "추상화에 의존하는가", "서비스가 구현체를 `new`로 생성", "인터페이스 + DI"]
        ]
      },
      concepts: [
        {
          id: "cs/srp",
          slug: "srp",
          title: "SRP",
          deep: true,
          def: "단일 책임 원칙. 클래스는 하나의 책임만 가져야 하며, 변경되는 이유가 하나뿐이어야 한다.",
          why: "여러 책임이 한 클래스에 섞이면 한 기능을 고칠 때 관련 없는 기능까지 깨질 수 있고, 클래스가 커져 이해와 테스트가 어려워진다.",
          how: [
            "\"책임\"은 \"변경의 이유\"로 판단한다. 누가(어떤 요구사항이) 이 코드를 바꾸게 만드는지를 본다.",
            "1) 클래스가 바뀌는 이유를 나열해 본다(할인 정책 변경, 메일 문구 변경, 로그 형식 변경…).",
            "2) 이유가 여러 개면 이유별로 클래스를 나눈다.",
            "3) 나눈 클래스끼리는 인터페이스로 협력하게 한다.",
            "- 신호: 클래스 이름에 And·Manager가 붙거나, 의존성이 많거나, 메서드들이 서로 다른 필드만 쓰면 책임이 섞인 것이다.",
            "- 스프링 예: Controller(요청·응답), Service(유스케이스), Repository(저장)로 나누는 계층 구조가 SRP의 적용이다."
          ],
          flow: ["변경 이유 나열", "이유별로 묶기", "이유가 여럿이면 분리", "분리한 클래스는 협력"],
          code: "// 위반: 주문 계산, 저장, 메일 발송이 한 클래스에\nclass OrderService {\n    long calculatePrice(Order o) { ... }\n    void save(Order o) { ... }        // DB 변경 시 수정\n    void sendMail(Order o) { ... }    // 메일 문구 변경 시 수정\n}\n\n// 적용: 변경 이유별로 분리\nclass PriceCalculator { long calculate(Order o) { ... } }\ninterface OrderRepository { void save(Order o); }\nclass OrderNotifier { void notifyOrdered(Order o) { ... } }",
          codeLang: "java",
          use: [
            "주문 서비스에서 알림 발송 로직을 OrderNotifier로 분리해 메일 문구 변경이 주문 로직에 영향을 주지 않게 한다.",
            "하나의 거대한 UserService를 회원 가입, 인증, 프로필 관리 서비스로 나눈다."
          ],
          warn: ["너무 잘게 나누면 클래스만 많아지고 흐름을 따라가기 어렵다. 실제로 함께 바뀌는 코드는 함께 둔다."],
          myth: [["SRP는 메서드를 하나만 두라는 뜻이다", "메서드 개수가 아니라 변경의 이유가 하나여야 한다는 뜻이다. 함께 바뀌는 메서드는 한 클래스에 있어도 된다."]],
          answer: "SRP는 클래스가 하나의 책임만 가져야 하며 변경되는 이유가 하나뿐이어야 한다는 원칙입니다. 책임이 섞이면 한 기능을 고칠 때 다른 기능이 깨질 수 있습니다. Controller, Service, Repository로 계층을 나누는 것도 SRP의 적용입니다.",
          analogy: "요리사가 요리, 서빙, 계산을 모두 하면 한 가지가 바뀔 때마다 모든 일이 흔들립니다.",
          qa: [
            "SRP를 실제로 어떻게 적용했나요?",
            "주문 서비스에 가격 계산, 저장, 알림 발송이 섞여 있어 알림 문구를 바꿀 때도 주문 로직을 건드려야 했습니다. 변경 이유별로 가격 계산기, 리포지토리, 알림 클래스로 나누고 서비스는 이들을 조율만 하게 했습니다. 그 결과 각 클래스를 독립적으로 테스트하고 수정할 수 있었습니다."
          ],
          followUps: [
            [
              "책임은 어떻게 판단하나요?",
              "이 클래스를 바꾸게 만드는 요구사항이나 사람이 누구인지 봅니다. 할인 정책 담당자와 알림 담당자가 같은 클래스를 고친다면 책임이 둘인 것입니다."
            ],
            [
              "SRP를 과하게 적용하면 어떤 문제가 생기나요?",
              "클래스가 너무 잘게 쪼개져 흐름을 따라가기 어렵고 파일만 늘어납니다. 실제로 함께 바뀌는 코드는 함께 두는 응집도도 함께 고려해야 합니다."
            ]
          ],
          related: ["cs/ocp", "cs/gyecheunghyeong-akitekcheo"]
        },
        {
          id: "cs/ocp",
          slug: "ocp",
          title: "OCP",
          deep: true,
          def: "개방-폐쇄 원칙. 소프트웨어는 확장에는 열려 있고 수정에는 닫혀 있어야 한다.",
          why: "새 기능을 추가할 때마다 기존 코드를 고치면 이미 검증된 코드에 버그가 들어갈 위험이 커진다. 기존 코드는 그대로 두고 새 코드를 추가하는 방식으로 확장해야 안전하다.",
          how: [
            "1) 바뀔 수 있는 부분(할인 정책, 결제 수단)을 찾아 인터페이스로 추상화한다.",
            "2) 기존 코드는 인터페이스에만 의존하게 한다.",
            "3) 새 요구사항이 오면 새 구현 클래스를 추가한다.",
            "4) 어떤 구현을 쓸지는 바깥(설정, DI 컨테이너)에서 정한다.",
            "- 신호: 새 종류가 추가될 때마다 `if/else`나 `switch`가 늘어나면 OCP 위반이다.",
            "- 스프링 DI는 구현체를 설정으로 바꿔 끼우게 해 OCP를 지키기 쉽게 만든다. 순수 자바에서 `new FixDiscountPolicy()`를 직접 쓰면 구현을 바꿀 때 클라이언트 코드를 고쳐야 한다."
          ],
          flow: ["변할 부분 찾기", "인터페이스로 추상화", "기존 코드는 추상화에 의존", "새 요구는 새 구현 추가", "DI로 구현 선택"],
          code: "interface DiscountPolicy { long discount(Member m, long price); }\n\nclass FixDiscountPolicy implements DiscountPolicy {\n    public long discount(Member m, long price) { return m.isVip() ? 1000 : 0; }\n}\n// 새 정책 추가: 기존 코드는 수정하지 않고 클래스만 추가\nclass RateDiscountPolicy implements DiscountPolicy {\n    public long discount(Member m, long price) { return m.isVip() ? price / 10 : 0; }\n}\n\n@Service\nclass OrderService {\n    private final DiscountPolicy policy;  // 어떤 정책인지 모른다\n    OrderService(DiscountPolicy policy) { this.policy = policy; }\n}",
          codeLang: "java",
          use: [
            "할인 정책을 DiscountPolicy 인터페이스로 두고 정률 정책을 추가할 때 클래스만 새로 만든다.",
            "알림 채널(메일, 슬랙, SMS)을 NotificationSender 구현체로 추가한다."
          ],
          warn: ["모든 곳을 미리 추상화하면 과설계가 된다. 실제로 변경이 생기거나 변경 가능성이 높은 지점에 적용한다."],
          myth: [["OCP를 지키려면 처음부터 모든 곳을 추상화해야 한다", "모든 곳을 미리 추상화하면 과설계가 된다. 변경이 실제로 생기거나 생길 가능성이 높은 지점에 적용한다."]],
          answer: "OCP는 확장에는 열려 있고 수정에는 닫혀 있어야 한다는 원칙입니다. 바뀔 수 있는 부분을 인터페이스로 추상화하고 새 요구사항은 새 구현 클래스로 추가합니다. 어떤 구현을 쓸지는 스프링 DI 같은 외부 설정이 정해 기존 코드를 고치지 않습니다.",
          analogy: "멀티탭에 새 기기를 꽂을 때 멀티탭을 뜯어고치지 않는 것과 같습니다.",
          qa: [
            "OCP를 설명하고 예를 들어 주세요.",
            "확장에는 열려 있고 수정에는 닫혀 있어야 한다는 원칙입니다. 예를 들어 할인 정책을 DiscountPolicy 인터페이스로 두고 정액, 정률 정책을 구현체로 만들면, 새 정책이 생겨도 클래스만 추가하고 주문 서비스 코드는 고치지 않습니다. 어떤 구현을 쓸지는 스프링 DI 설정이 정합니다."
          ],
          followUps: [
            [
              "스프링 없이도 OCP를 지킬 수 있나요?",
              "인터페이스로 의존하는 것까지는 가능하지만, 어딘가에서 new로 구현체를 골라야 하므로 그 코드는 바뀝니다. 객체 생성과 조립을 별도의 설정 클래스로 분리하면 되고, 스프링은 이 역할을 컨테이너로 대신합니다."
            ],
            [
              "switch 문은 모두 OCP 위반인가요?",
              "새 종류가 추가될 때마다 여러 곳의 switch를 고쳐야 한다면 위반입니다. 다만 객체를 고르는 팩토리 한 곳에만 있는 분기는 허용되는 경우가 많습니다."
            ]
          ],
          related: ["cs/dip", "cs/dahyeongseong", "cs/jeonryak-paeteon"]
        },
        {
          id: "cs/lsp",
          slug: "lsp",
          title: "LSP",
          deep: true,
          def: "리스코프 치환 원칙. 하위 타입은 언제나 상위 타입을 대신해도 프로그램이 올바르게 동작해야 한다.",
          why: "다형성은 \"부모 타입으로 호출해도 기대한 대로 동작한다\"는 믿음 위에서 성립한다. 하위 타입이 부모의 약속을 깨면 부모 타입을 쓰는 모든 코드가 언제 깨질지 모르게 된다.",
          how: [
            "하위 타입은 컴파일만 되는 것이 아니라 상위 타입의 \"행동 규약\"을 지켜야 한다.",
            "- 사전 조건을 더 강하게 만들면 안 된다: 부모가 0 이상을 받는데 자식이 양수만 받으면 위반이다.",
            "- 사후 조건을 약하게 만들면 안 된다: 부모가 정렬된 결과를 약속했으면 자식도 지켜야 한다.",
            "- 부모가 던지지 않는 예외를 새로 던지면 안 된다.",
            "대표 위반 예: 정사각형이 직사각형을 상속하고 `setWidth`가 높이까지 바꾸면, 너비 5·높이 4로 설정하고 넓이 20을 기대한 코드가 25를 받게 된다.",
            "또 다른 예: `List`를 구현하면서 `add`에서 `UnsupportedOperationException`을 던지는 불변 리스트는 사용하는 쪽이 이를 알아야 해 LSP 관점에서 주의가 필요하다."
          ],
          flow: ["상위 타입 규약 정의", "하위 타입이 상속·구현", "사전 조건 강화 여부 확인", "사후 조건·예외 규약 확인", "상위 타입 자리에 치환", "위반 시 상속 대신 분리"],
          code: "class Rectangle {\n    protected int width, height;\n    void setWidth(int w) { width = w; }\n    void setHeight(int h) { height = h; }\n    int area() { return width * height; }\n}\nclass Square extends Rectangle {\n    void setWidth(int w) { width = w; height = w; }   // 부모의 약속을 깨뜨림\n    void setHeight(int h) { width = h; height = h; }\n}\n\nvoid resize(Rectangle r) {\n    r.setWidth(5); r.setHeight(4);\n    assert r.area() == 20;   // Square가 들어오면 16 → 실패\n}",
          codeLang: "java",
          use: ["컬렉션 구현체를 만들 때 지원하지 않는 메서드에서 예외를 던지지 않도록 인터페이스를 다시 설계한다.", "부모 메서드보다 입력 조건을 까다롭게 만들지 않도록 리뷰한다."],
          warn: ["수학적 is-a(정사각형은 직사각형이다)가 코드의 is-a를 보장하지 않는다. 행동이 같아야 상속한다."],
          myth: [["수학적으로 is-a면 상속해도 된다", "정사각형은 수학적으로 직사각형이지만, 너비와 높이를 따로 바꾸는 행동을 지킬 수 없어 코드에서는 상속하면 안 된다."]],
          answer: "LSP는 하위 타입이 언제나 상위 타입을 대신해도 프로그램이 올바르게 동작해야 한다는 원칙입니다. 하위 타입은 컴파일만 되는 것이 아니라 상위 타입의 행동 규약을 지켜야 합니다. 정사각형이 직사각형을 상속하는 예가 대표적인 위반입니다.",
          analogy: "대리 기사가 운전을 맡았는데 후진을 못 한다면 운전자를 대신할 수 없습니다.",
          qa: [
            "LSP 위반 사례를 들어 주세요.",
            "정사각형이 직사각형을 상속해 너비를 바꿀 때 높이도 같이 바꾸면, 직사각형을 받아 너비 5와 높이 4를 설정한 코드가 넓이 20을 기대했다가 16을 받습니다. 하위 타입이 상위 타입의 행동 규약을 깨서 대체할 수 없게 된 것이므로, 이런 경우 상속 대신 별도의 타입으로 분리합니다."
          ],
          followUps: [
            [
              "LSP를 어기면 어떤 문제가 생기나요?",
              "부모 타입을 쓰는 코드가 특정 하위 타입에서만 오동작하므로, 결국 instanceof로 타입을 확인하는 분기가 생기고 다형성의 이점이 사라집니다."
            ],
            [
              "LSP를 지키는 규칙에는 무엇이 있나요?",
              "하위 타입은 사전 조건을 더 강하게 만들지 않고, 사후 조건을 약하게 만들지 않으며, 부모가 던지지 않는 새 예외를 던지지 않아야 합니다."
            ]
          ],
          related: ["cs/sangsok", "cs/dahyeongseong"]
        },
        {
          id: "cs/isp",
          slug: "isp",
          title: "ISP",
          deep: true,
          def: "인터페이스 분리 원칙. 클라이언트는 자신이 쓰지 않는 메서드에 의존하지 않아야 하며, 큰 인터페이스는 역할별로 작게 나눈다.",
          why: "큰 인터페이스 하나에 여러 역할을 몰아 두면 일부 기능만 필요한 구현체도 쓰지 않는 메서드를 억지로 구현해야 하고, 관계없는 메서드가 바뀌어도 모든 구현체와 사용처가 영향을 받는다.",
          how: [
            "1) 인터페이스를 사용하는 쪽(클라이언트)이 실제로 어떤 메서드를 쓰는지 본다.",
            "2) 함께 쓰이는 메서드끼리 묶어 역할별 인터페이스로 나눈다.",
            "3) 여러 역할을 하는 클래스는 여러 인터페이스를 구현한다.",
            "- 예: 복합기 인터페이스에 print·scan·fax가 모두 있으면 프린터만 되는 기기도 scan, fax를 구현해야 한다. `Printer`, `Scanner`, `Fax`로 나눈다.",
            "- 스프링 예: `UserDetailsService`(조회만), `UserDetailsManager`(생성·수정 포함)처럼 역할을 나눠 둔다."
          ],
          flow: ["클라이언트별 사용 메서드 파악", "함께 쓰는 메서드 묶기", "역할별 인터페이스 분리", "클래스가 필요한 역할만 구현", "클라이언트는 작은 인터페이스 의존"],
          code: "// 위반\ninterface MultiFunctionDevice { void print(); void scan(); void fax(); }\nclass SimplePrinter implements MultiFunctionDevice {\n    public void print() { ... }\n    public void scan() { throw new UnsupportedOperationException(); }\n    public void fax()  { throw new UnsupportedOperationException(); }\n}\n\n// 적용\ninterface Printer { void print(); }\ninterface Scanner { void scan(); }\nclass SimplePrinter2 implements Printer { public void print() { ... } }\nclass OfficeMachine implements Printer, Scanner { ... }",
          codeLang: "java",
          use: [
            "조회 전용 OrderQueryRepository와 저장용 OrderCommandRepository를 나눠 읽기 서비스가 쓰기 메서드에 의존하지 않게 한다.",
            "스프링 시큐리티의 UserDetailsService처럼 필요한 최소 메서드만 가진 인터페이스를 둔다."
          ],
          warn: ["메서드 하나짜리 인터페이스를 지나치게 많이 만들면 오히려 구조를 파악하기 어렵다. 실제 사용 단위로 나눈다."],
          answer: "ISP는 클라이언트가 자신이 쓰지 않는 메서드에 의존하지 않아야 한다는 원칙입니다. 여러 역할이 섞인 큰 인터페이스는 사용하는 쪽 기준으로 작게 나눕니다. 그러면 구현체가 쓰지 않는 메서드를 억지로 구현하지 않아도 됩니다.",
          qa: [
            "ISP는 왜 필요한가요?",
            "하나의 큰 인터페이스에 여러 역할이 섞여 있으면 일부만 필요한 구현체도 나머지를 억지로 구현해야 하고, 쓰지 않는 메서드가 바뀌어도 영향을 받습니다. 사용하는 쪽 기준으로 인터페이스를 작게 나누면 결합이 줄고 구현과 테스트가 쉬워집니다."
          ],
          followUps: [
            [
              "ISP와 SRP는 어떻게 다른가요?",
              "SRP는 클래스가 하나의 변경 이유를 갖도록 하는 원칙이고, ISP는 인터페이스를 사용하는 쪽 기준으로 작게 나누는 원칙입니다. 관점이 클래스의 책임이냐, 클라이언트의 의존이냐로 다릅니다."
            ],
            [
              "인터페이스를 너무 잘게 나누면 문제는 없나요?",
              "메서드 하나짜리 인터페이스가 지나치게 많으면 구조를 파악하기 어렵고 구현 클래스가 여러 인터페이스를 나열하게 됩니다. 실제로 함께 쓰이는 단위로 나눕니다."
            ]
          ],
          related: ["cs/srp", "cs/inteopeiseu"]
        },
        {
          id: "cs/dip",
          slug: "dip",
          title: "DIP",
          deep: true,
          def: "의존 역전 원칙. 고수준 모듈은 저수준 모듈의 구현에 의존하지 않고, 둘 다 추상화(인터페이스)에 의존해야 한다.",
          why: "비즈니스 로직(고수준)이 DB나 외부 API(저수준) 구현에 직접 의존하면 기술을 바꿀 때마다 핵심 로직을 고쳐야 하고, 단위 테스트에서 가짜 구현으로 바꾸기도 어렵다.",
          how: [
            "1) 고수준 모듈(서비스)이 필요한 기능을 인터페이스로 정의한다(`OrderRepository`).",
            "2) 저수준 모듈(JPA 구현, 외부 API 클라이언트)이 그 인터페이스를 구현한다.",
            "3) 어떤 구현을 쓸지는 바깥(DI 컨테이너)이 주입한다.",
            "\"역전\"이라는 이름은 원래 서비스 → DB 구현으로 향하던 의존 화살표가, 저수준 구현 → 고수준이 정의한 인터페이스로 방향이 뒤집히기 때문에 붙었다.",
            "- 인터페이스의 소유자는 사용하는 쪽(고수준)이어야 한다. 헥사고날 아키텍처의 포트가 바로 이 구조다.",
            "- DI는 DIP를 실현하는 도구다. DIP는 원칙, DI는 방법이다."
          ],
          flow: ["고수준이 인터페이스 정의", "저수준이 인터페이스 구현", "DI로 구현체 주입", "고수준은 구현을 모름"],
          code: "// 고수준 모듈이 정의한 추상화\npublic interface OrderRepository {\n    Order save(Order order);\n}\n\n@Service\nclass OrderService {\n    private final OrderRepository repository;   // 구현을 모른다\n    OrderService(OrderRepository repository) { this.repository = repository; }\n}\n\n// 저수준 모듈이 추상화를 구현\n@Repository\nclass JpaOrderRepository implements OrderRepository {\n    public Order save(Order order) { ... }\n}\n// 테스트에서는 MemoryOrderRepository를 주입",
          codeLang: "java",
          use: [
            "서비스 패키지에 OrderRepository 인터페이스를 두고 infra 패키지의 JPA 클래스가 구현한다.",
            "외부 결제 API를 PaymentGateway 인터페이스 뒤에 두어 결제사를 바꿔도 서비스 코드는 그대로 둔다."
          ],
          warn: ["인터페이스를 저수준 패키지(infra) 안에 두면 고수준이 여전히 그 패키지에 의존하게 된다. 인터페이스는 도메인·서비스 쪽에 둔다."],
          myth: [
            [
              "인터페이스만 만들면 DIP를 지킨 것이다",
              "인터페이스를 저수준(infra) 패키지 안에 두면 고수준이 여전히 그 패키지에 의존한다. 인터페이스의 소유는 사용하는 고수준 쪽이어야 한다."
            ]
          ],
          answer: "DIP는 고수준 모듈이 저수준 모듈의 구현에 의존하지 않고 둘 다 추상화에 의존해야 한다는 원칙입니다. 서비스가 필요한 기능을 인터페이스로 정의하고 JPA 구현체가 그 인터페이스를 구현합니다. 원래 서비스에서 DB로 향하던 의존 방향이 뒤집혀 역전이라고 부릅니다.",
          analogy: "가전제품은 발전소에 직접 연결되지 않고 콘센트 규격에 맞춥니다. 발전소가 바뀌어도 가전은 그대로입니다.",
          qa: [
            "DIP와 DI의 차이는 무엇인가요?",
            "DIP는 고수준 모듈과 저수준 모듈이 모두 추상화에 의존해야 한다는 설계 원칙이고, DI는 필요한 구현체를 외부에서 주입하는 기법입니다. 서비스가 OrderRepository 인터페이스에만 의존하게 설계하는 것이 DIP이고, 스프링이 JPA 구현체를 생성자로 넣어 주는 것이 DI입니다. DI는 DIP를 실현하는 수단입니다."
          ],
          followUps: [
            [
              "DIP와 DI의 차이는 무엇인가요?",
              "DIP는 추상화에 의존하라는 설계 원칙이고, DI는 필요한 구현체를 외부에서 넣어 주는 기법입니다. DI는 DIP를 실현하는 수단이며, 스프링 컨테이너가 DI를 자동으로 해 줍니다."
            ],
            [
              "DIP를 지키면 테스트가 쉬워지는 이유는요?",
              "서비스가 인터페이스에만 의존하므로 테스트에서 DB 대신 메모리 구현이나 Mock을 주입할 수 있습니다. 외부 시스템 없이 비즈니스 로직만 빠르게 검증할 수 있습니다."
            ]
          ],
          related: ["cs/ocp", "cs/heksagonal-akitekcheo", "cs/dahyeongseong"]
        }
      ]
    },
    {
      name: "설계 원칙",
      compare: {
        cols: ["기준", "인터페이스", "추상 클래스"],
        rows: [
          ["표현하는 것", "할 수 있는 역할", "공통 개념(무엇인가)"],
          ["다중 상속", "여러 개 구현 가능", "하나만 상속"],
          ["상태(필드)", "상수만", "인스턴스 필드 가능"],
          ["생성자", "없음", "있음"],
          ["대표 예", "Comparable, Runnable", "AbstractList"]
        ]
      },
      concepts: [
        {
          id: "cs/sangsokboda-johap",
          slug: "sangsokboda-johap",
          title: "상속보다 조합",
          deep: false,
          def: "다른 클래스의 기능이 필요할 때 상속하지 말고, 그 객체를 필드로 가지고 일을 맡기는(has-a) 방식을 우선하라는 원칙이다.",
          why: "상속은 상위 클래스 변경이 하위 클래스를 깨뜨리고 컴파일 시점에 관계가 고정되므로, 결합을 낮추고 런타임에 동작을 바꾸기 위해서다.",
          how: [
            "- 취약한 기반 클래스 문제: HashSet을 상속해 add 횟수를 세는데, 부모의 addAll이 내부적으로 add를 호출하면 개수가 두 번 세어진다. 부모 구현에 의존했기 때문이다.",
            "- 캡슐화 약화: 부모의 public 메서드가 자식에게 그대로 노출된다.",
            "- 조합의 장점: 내부 객체의 공개 인터페이스만 쓰므로 결합이 느슨하고, 실행 중에 다른 구현으로 바꿀 수 있다.",
            "상속은 진짜 is-a 관계이면서 부모가 확장을 위해 설계된 경우에만 쓴다(Effective Java 아이템 18)."
          ],
          use: [
            "HashSet을 상속해 기능을 덧붙이는 대신 Set을 필드로 감싼 래퍼 클래스를 만든다.",
            "서비스에 공통 기능이 필요하면 BaseService 상속 대신 별도 컴포넌트를 주입받는다."
          ],
          answer: "상속보다 조합은 다른 클래스의 기능이 필요할 때 상속하지 말고 그 객체를 필드로 두고 일을 맡기라는 원칙입니다. 상속은 부모 구현에 강하게 묶여 부모가 바뀌면 자식이 깨질 수 있지만, 조합은 공개 인터페이스만 써서 결합이 느슨하고 실행 중에 구현을 바꿀 수 있습니다.",
          analogy: "자동차가 엔진을 상속받는 것이 아니라 엔진을 장착하는 것과 같습니다. 엔진은 언제든 교체할 수 있습니다.",
          followUps: [
            [
              "그럼 상속은 언제 쓰나요?",
              "진짜 is-a 관계가 성립하고, 부모 클래스가 확장을 위해 설계·문서화되어 있을 때 씁니다. 프레임워크가 제공하는 추상 클래스(OncePerRequestFilter 등)를 확장하는 경우가 대표적입니다."
            ]
          ],
          related: ["cs/sangsok", "cs/jeonryak-paeteon", "cs/dekoreiteo-paeteon"]
        },
        {
          id: "cs/inteopeiseu",
          slug: "inteopeiseu",
          title: "인터페이스",
          deep: false,
          def: "\"무엇을 할 수 있는가\"라는 역할(능력)만 정의하는 타입으로, 한 클래스가 여러 인터페이스를 구현할 수 있다.",
          why: "호출하는 쪽이 구현 클래스에 직접 의존하면 구현을 바꿀 때마다 수정해야 하므로, 역할에만 의존해 구현을 쉽게 갈아 끼우기 위해서다.",
          how: [
            "- 필드는 상수(`public static final`)만 가질 수 있다.",
            "- Java 8부터 default·static 메서드, Java 9부터 private 메서드를 가질 수 있다.",
            "- 서로 관련 없는 클래스에도 같은 역할을 부여할 수 있다. 예: `Comparable`, `Runnable`, `AutoCloseable`.",
            "구현이 아닌 역할에 의존하게 해 다형성, OCP, DIP의 기반이 된다."
          ],
          use: ["Repository, Client, Policy처럼 구현이 바뀔 수 있는 협력 대상은 인터페이스로 정의한다."],
          answer: "인터페이스는 무엇을 할 수 있는가라는 역할만 정의하는 타입으로, 한 클래스가 여러 인터페이스를 구현할 수 있습니다. 필드는 상수만 가질 수 있고 Java 8부터 default 메서드를 가질 수 있습니다. 구현이 아닌 역할에 의존하게 해 다형성과 DIP의 기반이 됩니다.",
          followUps: [
            [
              "default 메서드는 왜 생겼나요?",
              "이미 많은 구현체가 있는 인터페이스에 새 메서드를 추가하면 모든 구현체가 깨지므로, 기본 구현을 제공해 하위 호환을 지키기 위해 Java 8에 추가되었습니다. Collection의 stream 메서드가 대표 예입니다."
            ]
          ],
          related: ["cs/chusang-keulraeseu", "cs/dip"]
        },
        {
          id: "cs/chusang-keulraeseu",
          slug: "chusang-keulraeseu",
          title: "추상 클래스",
          deep: false,
          def: "\"무엇인가\"라는 공통 개념을 정의하고, 하위 클래스가 공유할 상태와 일부 구현을 가질 수 있는 미완성 클래스다.",
          why: "여러 하위 클래스가 상태와 공통 구현을 공유하면서 일부 단계만 다르게 구현해야 할 때 중복을 없애기 위해서다.",
          how: [
            "- 인스턴스 필드와 생성자를 가질 수 있다.",
            "- 일부 메서드만 abstract로 두고 나머지는 구현해 둘 수 있어 템플릿 메서드 패턴에 맞다.",
            "- 단일 상속만 가능하다.",
            "예: `AbstractList`, 스프링의 `OncePerRequestFilter`. 보통 인터페이스를 먼저 정의하고, 공통 구현이 필요하면 `AbstractXxx` 골격 클래스를 함께 제공한다."
          ],
          use: ["여러 외부 API 클라이언트의 공통 인증과 재시도 로직을 AbstractApiClient에 두고 요청 부분만 하위 클래스가 구현한다."],
          answer: "추상 클래스는 공통 개념을 정의하고 하위 클래스가 공유할 상태와 일부 구현을 가질 수 있는 미완성 클래스입니다. 인스턴스 필드와 생성자를 가질 수 있지만 단일 상속만 가능합니다. 흐름은 고정하고 일부 단계만 구현하게 하는 템플릿 메서드 패턴에 잘 맞습니다.",
          followUps: [
            [
              "인터페이스와 추상 클래스 중 무엇을 먼저 고려하나요?",
              "보통 인터페이스를 먼저 정의해 다중 구현의 유연성을 확보합니다. 구현체들이 상태나 코드를 많이 공유해야 하면 인터페이스와 함께 AbstractXxx 골격 클래스를 제공합니다."
            ]
          ],
          related: ["cs/inteopeiseu", "cs/tempeulrit-meseodeu-paeteon"]
        },
        {
          id: "cs/dimiteo-beopchik",
          slug: "dimiteo-beopchik",
          title: "디미터 법칙",
          deep: false,
          def: "객체는 직접 아는 협력자에게만 메시지를 보내고, 협력자의 내부 구조를 따라 들어가지 말라는 원칙이다.",
          why: "`a.getB().getC().do()`처럼 객체 내부 구조를 따라가는 코드는 중간 구조가 바뀌면 함께 깨지므로, 결합을 줄이기 위해서다.",
          how: [
            "`order.getCustomer().getAddress().getCity()`처럼 점이 길게 이어지면 호출하는 쪽이 여러 객체의 내부 구조를 알게 되어 결합이 커진다.",
            "대신 `order.shippingCity()`처럼 필요한 일을 직접 시킨다.",
            "\"묻지 말고 시켜라\"와 같은 맥락이며 캡슐화를 지키는 방법이다."
          ],
          use: ["order.getCustomer().getAddress().getCity() 대신 order.shippingCity()를 만든다."],
          warn: ["스트림이나 빌더처럼 같은 객체를 반환하는 메서드 체이닝은 위반이 아니다."],
          myth: [["점(.)이 여러 개면 무조건 위반이다", "스트림이나 빌더처럼 같은 객체를 계속 반환하는 메서드 체이닝은 내부 구조를 파고드는 것이 아니므로 위반이 아니다."]],
          answer: "디미터 법칙은 객체가 직접 아는 협력자에게만 메시지를 보내고, 협력자의 내부 구조를 따라 들어가지 말라는 원칙입니다. a.getB().getC()처럼 연쇄 호출이 길면 여러 객체의 내부를 알게 되어 결합이 커집니다. 필요한 일을 직접 시키는 메서드를 만듭니다.",
          followUps: [
            [
              "디미터 법칙을 지키면 무엇이 좋아지나요?",
              "객체의 내부 구조가 바뀌어도 호출하는 쪽이 영향을 받지 않고, 결합도가 낮아져 테스트와 변경이 쉬워집니다. 캡슐화를 지키는 구체적인 방법입니다."
            ]
          ],
          related: ["cs/kaepsyulhwa"]
        }
      ]
    },
    {
      name: "생성 패턴",
      compare: {
        cols: ["기준", "싱글톤 패턴", "팩토리 패턴", "빌더 패턴"],
        rows: [
          ["해결하는 문제", "인스턴스 하나만 공유", "구체 클래스 선택 숨김", "많은 선택 필드 생성"],
          ["핵심 구조", "private 생성자 + 정적 접근", "생성 메서드/클래스 분리", "단계별 setter 후 `build()`"],
          ["주의점", "전역 상태, 테스트 어려움", "클래스 수 증가", "코드량 증가"],
          ["자바/스프링 예", "스프링 빈(기본 스코프)", "`List.of()`, `BeanFactory`", "`StringBuilder`, Lombok `@Builder`"]
        ]
      },
      concepts: [
        {
          id: "cs/singgeulton-paeteon",
          slug: "singgeulton-paeteon",
          title: "싱글톤 패턴",
          deep: false,
          def: "클래스의 인스턴스를 하나만 만들고 어디서든 그 인스턴스에 접근하게 하는 패턴이다.",
          why: "설정이나 커넥션 풀처럼 하나만 있어야 하는 객체가 여러 개 생겨 자원이 낭비되거나 상태가 어긋나는 것을 막기 위해서다.",
          how: [
            "직접 구현하면 private 생성자와 static 인스턴스, `getInstance()`를 쓴다.",
            "- 문제점: 클라이언트가 구체 클래스에 의존해 DIP를 어기고, 테스트에서 다른 객체로 바꾸기 어렵고, 상속이 불가능하다.",
            "- 스프링은 싱글톤 레지스트리: 평범한 클래스를 컨테이너가 하나만 만들어 관리하므로 이런 단점 없이 싱글톤을 쓴다."
          ],
          use: ["스프링 빈은 기본이 싱글톤이므로 요청별 상태를 필드에 두지 않고 무상태로 설계한다."],
          warn: ["싱글톤 객체에 요청마다 바뀌는 상태를 두면 동시성 버그가 생긴다. 무상태로 설계한다."],
          myth: [
            [
              "스프링 빈은 싱글톤 패턴으로 구현된 클래스다",
              "스프링 빈은 private 생성자나 getInstance 없이 평범하게 작성하고, 컨테이너가 인스턴스를 하나만 만들어 관리하는 싱글톤 레지스트리 방식이다."
            ]
          ],
          answer: "싱글톤 패턴은 클래스의 인스턴스를 하나만 만들고 어디서든 그 인스턴스를 쓰게 하는 패턴입니다. 직접 구현하면 private 생성자와 static 인스턴스를 쓰는데, 테스트와 확장이 어렵습니다. 스프링은 평범한 클래스를 컨테이너가 하나만 관리해 이런 단점 없이 싱글톤을 제공합니다.",
          followUps: [
            [
              "직접 구현한 싱글톤의 단점은 무엇인가요?",
              "사용하는 쪽이 getInstance로 구체 클래스에 직접 의존해 DIP를 어기고, 테스트에서 가짜 객체로 바꾸기 어렵습니다. 또 private 생성자 때문에 상속할 수 없고, 멀티스레드에서 초기화를 잘못하면 인스턴스가 둘 생길 수 있습니다."
            ]
          ],
          related: ["cs/paektori-paeteon"]
        },
        {
          id: "cs/paektori-paeteon",
          slug: "paektori-paeteon",
          title: "팩토리 패턴",
          deep: false,
          def: "객체 생성 로직을 별도의 메서드나 클래스로 분리해, 사용하는 쪽이 어떤 구체 클래스를 만들지 몰라도 되게 하는 패턴이다.",
          why: "호출하는 쪽이 `new`로 구체 클래스를 직접 고르면 새 타입이 추가될 때마다 호출 코드를 고쳐야 하므로, 생성 책임을 한곳에 모으기 위해서다.",
          how: [
            "- 정적 팩토리 메서드: `LocalDate.of(...)`, `List.of(...)`처럼 이름 있는 생성 메서드를 제공한다. 캐싱하거나 하위 타입을 반환할 수 있다.",
            "- 팩토리 메서드 패턴: 생성할 객체 타입을 하위 클래스가 결정한다.",
            "- 추상 팩토리: 관련 객체 묶음을 일관되게 만든다.",
            "스프링의 `BeanFactory`와 `FactoryBean`이 대표적이다."
          ],
          use: [
            "Order.create(member, items)처럼 이름 있는 정적 팩토리 메서드로 생성 의도와 검증을 한곳에 둔다.",
            "결제 수단 코드에 맞는 PaymentClient를 반환하는 팩토리를 만든다."
          ],
          answer: "팩토리 패턴은 객체 생성 로직을 별도의 메서드나 클래스로 분리해 사용하는 쪽이 구체 클래스를 몰라도 되게 하는 패턴입니다. 정적 팩토리 메서드, 팩토리 메서드, 추상 팩토리 등이 있고, 스프링의 BeanFactory가 대표적인 팩토리입니다.",
          followUps: [
            [
              "정적 팩토리 메서드의 장점은 무엇인가요?",
              "이름으로 생성 의도를 드러낼 수 있고, 매번 새 객체를 만들지 않고 캐싱할 수 있으며, 반환 타입의 하위 타입을 돌려줄 수 있습니다. List.of나 LocalDate.of가 예입니다."
            ]
          ],
          related: ["cs/singgeulton-paeteon", "cs/bildeo-paeteon"]
        },
        {
          id: "cs/bildeo-paeteon",
          slug: "bildeo-paeteon",
          title: "빌더 패턴",
          deep: false,
          def: "필드가 많거나 선택적인 객체를 단계적으로, 읽기 쉽게 만드는 패턴이다.",
          why: "매개변수가 많은 생성자는 순서를 헷갈리기 쉽고 setter는 불변성을 깨므로, 읽기 쉽고 안전하게 객체를 만들기 위해서다.",
          how: [
            "생성자 파라미터가 많으면 순서를 헷갈리기 쉽다. `Order.builder().memberId(1L).price(1000).build()`처럼 이름으로 값을 지정한다.",
            "- 불변 객체를 만들기 좋고, 필수 값 검증을 `build()`에서 한 번에 할 수 있다.",
            "- 실무에서는 Lombok `@Builder`를 많이 쓴다."
          ],
          use: ["테스트 픽스처에서 필요한 필드만 지정해 객체를 만든다.", "외부 API 요청 객체를 선택 파라미터가 많을 때 빌더로 조립한다."],
          warn: ["JPA 엔티티에 무분별하게 빌더를 열어 두면 필수 값 없이 객체가 만들어질 수 있다."],
          answer: "빌더 패턴은 필드가 많거나 선택적인 객체를 이름으로 값을 지정하며 단계적으로 만드는 패턴입니다. 생성자 파라미터 순서를 헷갈리는 문제를 없애고 불변 객체를 만들기 좋습니다. 실무에서는 Lombok @Builder를 많이 씁니다.",
          followUps: [
            [
              "엔티티에 @Builder를 쓸 때 주의할 점은요?",
              "클래스 전체에 붙이면 필수 값 없이도 객체를 만들 수 있고 id 같은 필드까지 열립니다. 필요한 파라미터만 받는 생성자에 @Builder를 붙여 범위를 제한합니다."
            ]
          ],
          related: ["cs/paektori-paeteon"]
        }
      ]
    },
    {
      name: "구조 패턴",
      compare: {
        cols: ["기준", "프록시 패턴", "데코레이터 패턴", "어댑터 패턴"],
        rows: [
          ["의도", "접근 제어", "기능 추가", "인터페이스 변환"],
          ["인터페이스", "대상과 같음", "대상과 같음", "대상과 다름"],
          ["여러 겹 감싸기", "드묾", "자주", "드묾"],
          ["스프링 예", "AOP, 지연 로딩", "HttpServletRequestWrapper", "HandlerAdapter"]
        ]
      },
      concepts: [
        {
          id: "cs/peuroksi-paeteon",
          slug: "peuroksi-paeteon",
          title: "프록시 패턴",
          deep: true,
          def: "실제 객체 대신 같은 인터페이스를 가진 대리 객체를 두어, 실제 객체에 대한 접근을 제어하거나 부가 기능을 더하는 패턴이다.",
          why: "실제 객체의 코드를 고치지 않고도 지연 로딩, 접근 제어, 캐싱, 트랜잭션 같은 기능을 끼워 넣을 수 있다. 클라이언트는 프록시인지 실제 객체인지 몰라도 된다.",
          how: [
            "1) 프록시는 실제 객체와 같은 타입(인터페이스 구현 또는 클래스 상속)이다.",
            "2) 클라이언트는 실제 객체 대신 프록시를 주입받는다.",
            "3) 프록시가 호출을 받아 앞뒤로 부가 작업을 하고 실제 객체에 위임한다.",
            "- 접근 제어 목적: 권한 확인, 지연 로딩(JPA 지연 로딩 프록시), 캐싱.",
            "- 부가 기능 목적(데코레이터와 구조가 같다): 로깅, 트랜잭션.",
            "- 스프링 AOP, `@Transactional`, `@Cacheable`, `@Async`가 모두 프록시로 동작한다. 그래서 같은 클래스 안의 내부 호출에는 적용되지 않는다."
          ],
          flow: ["클라이언트가 프록시 호출", "프록시가 사전 작업", "실제 객체에 위임", "프록시가 사후 작업", "결과 반환"],
          code: "interface OrderService { void order(Long id); }\n\nclass RealOrderService implements OrderService {\n    public void order(Long id) { /* 핵심 로직 */ }\n}\n\nclass TransactionProxy implements OrderService {\n    private final OrderService target;\n    TransactionProxy(OrderService target) { this.target = target; }\n\n    public void order(Long id) {\n        tx.begin();\n        try { target.order(id); tx.commit(); }   // 실제 객체에 위임\n        catch (RuntimeException e) { tx.rollback(); throw e; }\n    }\n}",
          codeLang: "java",
          use: [
            "@Transactional 빈이 실제로는 프록시라 트랜잭션 시작과 커밋을 대신 처리한다.",
            "JPA 지연 로딩에서 연관 엔티티 자리에 프록시를 두고 실제 접근 시 조회한다."
          ],
          warn: [
            "프록시를 거치지 않는 내부 호출(this.method())에는 부가 기능이 적용되지 않는다.",
            "CGLIB 프록시는 상속으로 만들므로 final 클래스나 final 메서드에는 적용할 수 없다."
          ],
          myth: [["같은 클래스 안에서 호출해도 프록시 기능이 적용된다", "this로 호출하면 프록시를 거치지 않아 @Transactional 같은 부가 기능이 적용되지 않는다."]],
          answer: "프록시 패턴은 실제 객체와 같은 인터페이스를 가진 대리 객체를 두어 접근을 제어하거나 부가 기능을 더하는 패턴입니다. 클라이언트는 프록시인지 모른 채 호출하고, 프록시가 앞뒤 작업 후 실제 객체에 위임합니다. 스프링 AOP, @Transactional, JPA 지연 로딩이 모두 프록시로 동작합니다.",
          analogy: "연예인 대신 매니저가 일정을 먼저 받고, 필요한 경우에만 연예인에게 전달하는 것과 같습니다.",
          qa: [
            "스프링에서 프록시 패턴은 어디에 쓰이나요?",
            "스프링 AOP가 대표적입니다. @Transactional이 붙은 빈은 실제 객체 대신 프록시가 주입되고, 프록시가 트랜잭션을 시작한 뒤 실제 메서드를 호출하고 결과에 따라 커밋이나 롤백을 합니다. JPA 지연 로딩도 연관 엔티티 자리에 프록시를 두었다가 실제 접근할 때 조회합니다."
          ],
          followUps: [
            [
              "프록시와 데코레이터는 어떻게 다른가요?",
              "구조는 같지만 의도가 다릅니다. 프록시는 지연 로딩, 권한 확인처럼 접근을 제어하는 것이 목적이고, 데코레이터는 로깅, 버퍼링처럼 기능을 덧붙이는 것이 목적입니다."
            ],
            [
              "스프링은 프록시를 어떻게 만드나요?",
              "인터페이스 기반 JDK 동적 프록시나 클래스를 상속하는 CGLIB으로 만들며, 스프링 부트는 기본으로 CGLIB을 씁니다. 빈 후처리기가 원본 빈 대신 프록시를 컨테이너에 등록합니다."
            ],
            [
              "final 클래스에 @Transactional을 붙이면 어떻게 되나요?",
              "CGLIB은 상속으로 프록시를 만들기 때문에 final 클래스나 final 메서드는 프록시할 수 없어 기능이 적용되지 않거나 오류가 납니다. Kotlin은 allopen 플러그인으로 해결합니다."
            ]
          ],
          related: ["cs/dekoreiteo-paeteon", "cs/eodaepteo-paeteon"]
        },
        {
          id: "cs/dekoreiteo-paeteon",
          slug: "dekoreiteo-paeteon",
          title: "데코레이터 패턴",
          deep: false,
          def: "객체를 같은 인터페이스의 다른 객체로 감싸서 기능을 동적으로 덧붙이는 패턴이다.",
          why: "로깅이나 캐싱 같은 부가 기능을 조합마다 하위 클래스로 만들면 클래스 수가 폭발하므로, 기존 코드를 고치지 않고 감싸서 덧붙이기 위해서다.",
          how: [
            "데코레이터는 감싼 객체에 일을 맡기면서 앞뒤로 기능을 추가한다. 여러 겹으로 감쌀 수 있다.",
            "예: `new BufferedReader(new InputStreamReader(new FileInputStream(file)))` — 각 층이 버퍼링, 문자 변환 기능을 더한다.",
            "구조는 프록시와 같지만, 프록시는 \"접근 제어\"가, 데코레이터는 \"기능 추가\"가 의도다."
          ],
          use: [
            "HTTP 클라이언트에 로깅, 재시도, 인증 헤더 추가 기능을 데코레이터로 하나씩 감싼다.",
            "캐시를 적용한 Repository 데코레이터로 원본 구현을 고치지 않고 캐싱을 더한다."
          ],
          answer: "데코레이터 패턴은 객체를 같은 인터페이스의 다른 객체로 감싸 기능을 동적으로 덧붙이는 패턴입니다. 여러 겹으로 감싸 기능을 조합할 수 있습니다. 자바 I/O의 BufferedReader가 대표적인 예입니다.",
          followUps: [
            [
              "상속으로 기능을 추가하는 것과 무엇이 다른가요?",
              "상속은 조합마다 하위 클래스를 만들어야 해 클래스 수가 폭발하지만, 데코레이터는 필요한 기능만 실행 중에 골라 겹쳐 감쌀 수 있어 유연합니다."
            ]
          ],
          related: ["cs/peuroksi-paeteon", "cs/sangsokboda-johap"]
        },
        {
          id: "cs/eodaepteo-paeteon",
          slug: "eodaepteo-paeteon",
          title: "어댑터 패턴",
          deep: false,
          def: "호환되지 않는 인터페이스를 가진 객체를 클라이언트가 기대하는 인터페이스로 바꿔 주는 패턴이다.",
          why: "외부 라이브러리나 레거시 코드의 인터페이스가 우리 코드가 기대하는 형태와 달라도, 양쪽을 고치지 않고 연결하기 위해서다.",
          how: [
            "돼지코 변환기처럼, 기존 코드를 고치지 않고 중간에 변환 객체를 둔다.",
            "- 스프링 MVC의 `HandlerAdapter`: `@RequestMapping` 메서드, `HttpRequestHandler` 등 형태가 다른 핸들러를 DispatcherServlet이 같은 방식으로 실행하게 해 준다.",
            "- 외부 결제 SDK를 우리 `PaymentClient` 인터페이스에 맞추는 클래스도 어댑터다."
          ],
          use: ["외부 결제 SDK를 우리 PaymentClient 인터페이스에 맞추는 어댑터 클래스를 만든다.", "레거시 시스템의 응답 형식을 새 도메인 모델로 변환하는 어댑터를 둔다."],
          answer: "어댑터 패턴은 호환되지 않는 인터페이스를 가진 객체를 클라이언트가 기대하는 인터페이스로 바꿔 주는 패턴입니다. 기존 코드를 고치지 않고 중간에 변환 객체를 둡니다. 스프링 MVC의 HandlerAdapter가 대표적입니다.",
          analogy: "해외여행에서 쓰는 돼지코 변환기와 같습니다. 플러그와 콘센트 모양이 달라도 연결해 줍니다.",
          followUps: [
            [
              "HandlerAdapter는 왜 필요한가요?",
              "스프링 MVC의 핸들러는 @RequestMapping 메서드, HttpRequestHandler 등 형태가 다양합니다. DispatcherServlet이 핸들러 종류를 몰라도 같은 방식으로 실행할 수 있도록 각 형태에 맞는 어댑터가 실행을 대신합니다."
            ]
          ],
          related: ["cs/peuroksi-paeteon", "cs/heksagonal-akitekcheo"]
        }
      ]
    },
    {
      name: "행위 패턴",
      compare: {
        cols: ["기준", "전략 패턴", "템플릿 메서드 패턴"],
        rows: [
          ["바뀌는 부분", "알고리즘 전체", "알고리즘 일부 단계"],
          ["구현 방식", "조합(인터페이스 주입)", "상속(추상 메서드)"],
          ["교체 시점", "실행 중에도 가능", "컴파일 시점 고정"],
          ["스프링 예", "PasswordEncoder", "OncePerRequestFilter"]
        ]
      },
      concepts: [
        {
          id: "cs/jeonryak-paeteon",
          slug: "jeonryak-paeteon",
          title: "전략 패턴",
          deep: true,
          def: "바뀔 수 있는 알고리즘을 인터페이스로 분리하고, 실행 시점에 원하는 구현을 골라 끼우는 패턴이다.",
          why: "할인 정책이나 결제 수단처럼 종류가 늘어날 수 있는 로직을 `if/else`로 처리하면 새 종류가 생길 때마다 기존 코드를 고쳐야 한다. 전략으로 분리하면 새 클래스만 추가하면 된다(OCP).",
          how: [
            "1) 전략 인터페이스를 정의한다(`DiscountPolicy`).",
            "2) 알고리즘별로 구현 클래스를 만든다(`FixDiscountPolicy`, `RateDiscountPolicy`).",
            "3) 사용하는 쪽(컨텍스트)은 전략 인터페이스를 필드로 갖고 일을 맡긴다.",
            "4) 어떤 전략을 쓸지는 생성자 주입이나 실행 시 선택으로 정한다.",
            "- 스프링에서는 같은 인터페이스의 구현체를 `Map<String, DiscountPolicy>`로 모두 주입받아, 요청 값에 따라 골라 쓰는 방식이 자주 쓰인다.",
            "- 예: `Comparator`, `PasswordEncoder`, 스프링 시큐리티의 `AuthenticationProvider`."
          ],
          flow: ["전략 인터페이스 정의", "알고리즘별 구현 작성", "컨텍스트가 전략 보유", "실행 시 전략 선택", "전략에 위임해 실행"],
          code: "interface DiscountPolicy { long discount(long price); }\n\n@Component(\"fix\")\nclass FixDiscountPolicy implements DiscountPolicy {\n    public long discount(long price) { return 1000; }\n}\n@Component(\"rate\")\nclass RateDiscountPolicy implements DiscountPolicy {\n    public long discount(long price) { return price / 10; }\n}\n\n@Service\nclass DiscountService {\n    private final Map<String, DiscountPolicy> policies; // 빈 이름 → 구현체\n    DiscountService(Map<String, DiscountPolicy> policies) { this.policies = policies; }\n\n    long discount(String code, long price) {\n        return policies.get(code).discount(price);\n    }\n}",
          codeLang: "java",
          use: [
            "결제 수단 코드에 따라 Map<String, PaymentStrategy>에서 구현체를 꺼내 실행한다.",
            "회원 등급별 할인 계산을 DiscountPolicy 구현체로 나눈다."
          ],
          warn: ["전략이 두세 개뿐이고 늘어날 가능성이 없다면 단순한 분기가 더 읽기 쉬울 수 있다."],
          myth: [["분기가 있으면 무조건 전략 패턴으로 바꿔야 한다", "종류가 두세 개로 고정되고 늘어날 가능성이 없으면 단순한 분기가 더 읽기 쉽다."]],
          answer: "전략 패턴은 바뀔 수 있는 알고리즘을 인터페이스로 분리하고 실행 시점에 원하는 구현을 골라 끼우는 패턴입니다. if-else로 종류를 나누는 대신 구현 클래스를 추가하므로 OCP를 지킵니다. 스프링에서는 같은 인터페이스의 구현체를 Map으로 주입받아 골라 쓰는 방식이 자주 쓰입니다.",
          analogy: "내비게이션에서 최단 거리, 최소 시간, 무료 도로 중 경로 탐색 방식을 고르는 것과 같습니다.",
          qa: [
            "전략 패턴을 어디에 적용해 보셨나요?",
            "결제 수단별 결제 로직을 PaymentStrategy 인터페이스로 분리하고 카카오페이, 토스 구현체를 빈으로 등록했습니다. 서비스는 Map으로 모든 구현체를 주입받아 요청의 결제 수단 코드로 골라 실행합니다. 새 결제 수단이 생기면 구현 클래스만 추가하면 되어 기존 코드를 고치지 않습니다."
          ],
          followUps: [
            [
              "전략 패턴과 템플릿 메서드 패턴의 차이는요?",
              "전략 패턴은 알고리즘 전체를 인터페이스로 분리해 조합으로 주입하므로 실행 중에도 바꿀 수 있습니다. 템플릿 메서드는 흐름을 부모가 정하고 일부 단계만 상속으로 바꾸므로 부모와 강하게 결합됩니다."
            ],
            [
              "스프링에서 전략을 고르는 방법은 무엇인가요?",
              "같은 인터페이스 구현체를 List나 Map<String, T>로 주입받아 요청 값으로 고르거나, 구현체마다 supports 메서드를 두어 지원하는 것을 찾습니다. 하나만 쓴다면 @Primary나 @Qualifier로 지정합니다."
            ],
            [
              "스프링 내부에서 전략 패턴의 예는요?",
              "PasswordEncoder, 시큐리티의 AuthenticationProvider, HandlerMethodArgumentResolver 등이 있습니다. 공통 인터페이스로 여러 구현을 두고 상황에 맞는 것을 골라 씁니다."
            ]
          ],
          related: ["cs/ocp", "cs/dahyeongseong", "cs/tempeulrit-meseodeu-paeteon"]
        },
        {
          id: "cs/tempeulrit-meseodeu-paeteon",
          slug: "tempeulrit-meseodeu-paeteon",
          title: "템플릿 메서드 패턴",
          deep: false,
          def: "알고리즘의 전체 흐름(뼈대)은 부모 클래스가 정하고, 바뀌는 일부 단계만 하위 클래스가 구현하는 패턴이다.",
          why: "전체 흐름은 같고 일부 단계만 다른 코드를 클래스마다 복사하면 흐름 수정 시 모두 고쳐야 하므로, 흐름을 한곳에 고정하기 위해서다.",
          how: [
            "부모의 템플릿 메서드가 단계 순서를 고정하고, 단계 중 일부를 abstract 메서드로 남긴다.",
            "- 예: `OncePerRequestFilter`는 필터 공통 처리를 하고 `doFilterInternal`만 구현하게 한다.",
            "- 템플릿 콜백 패턴: 상속 대신 콜백(람다)으로 바뀌는 부분을 넘긴다. `JdbcTemplate`, `RestTemplate`, `TransactionTemplate`이 연결·해제·예외 처리 같은 반복 코드를 맡고 핵심 로직만 콜백으로 받는다."
          ],
          use: [
            "OncePerRequestFilter를 상속해 doFilterInternal만 구현한다.",
            "JdbcTemplate으로 커넥션 획득과 해제는 맡기고 SQL과 결과 매핑만 작성한다."
          ],
          warn: ["상속 기반이라 부모와 강하게 결합된다. 변하는 부분이 크면 전략 패턴이나 콜백 방식이 유연하다."],
          answer: "템플릿 메서드 패턴은 알고리즘의 전체 흐름은 부모 클래스가 정하고 바뀌는 일부 단계만 하위 클래스가 구현하는 패턴입니다. 상속 대신 콜백으로 바뀌는 부분을 넘기는 템플릿 콜백 방식도 있으며, JdbcTemplate과 TransactionTemplate이 대표적입니다.",
          followUps: [
            [
              "템플릿 콜백 패턴은 무엇이 다른가요?",
              "바뀌는 부분을 하위 클래스가 아니라 메서드 인자로 넘기는 콜백(람다)으로 전달합니다. 상속이 필요 없어 결합이 느슨하고, 하나의 템플릿을 여러 곳에서 다른 콜백으로 재사용할 수 있습니다."
            ]
          ],
          related: ["cs/jeonryak-paeteon", "cs/chusang-keulraeseu"]
        },
        {
          id: "cs/opjeobeo-paeteon",
          slug: "opjeobeo-paeteon",
          title: "옵저버 패턴",
          deep: false,
          def: "한 객체의 상태 변화를 그 객체를 구독하는 여러 객체에게 자동으로 알리는 패턴이다.",
          why: "상태 변화를 알려야 할 대상을 발행자가 직접 호출하면 대상이 늘 때마다 발행자를 고쳐야 하므로, 둘 사이의 결합을 끊기 위해서다.",
          how: [
            "발행자는 구독자 목록만 알고 구독자의 구체 동작은 모른다. 구독자를 추가해도 발행자는 바뀌지 않는다.",
            "- 스프링: `ApplicationEventPublisher.publishEvent(new OrderCompletedEvent(...))`로 발행하고 `@EventListener` 메서드가 받는다.",
            "- `@TransactionalEventListener(phase = AFTER_COMMIT)`를 쓰면 트랜잭션이 커밋된 뒤에만 알림을 처리한다.",
            "서비스 간 직접 의존을 끊어 순환 참조를 해결하는 데에도 쓴다."
          ],
          flow: ["구독자 등록", "발행자 상태 변화", "이벤트 발행", "구독자들에게 전달", "각 구독자가 처리"],
          use: [
            "주문 완료 이벤트를 발행하고 포인트 적립, 알림 발송 리스너가 각자 처리한다.",
            "@TransactionalEventListener(phase = AFTER_COMMIT)로 커밋된 뒤에만 메일을 보낸다."
          ],
          myth: [["스프링 이벤트는 기본적으로 비동기다", "기본은 발행한 스레드에서 동기로 실행된다. 비동기로 하려면 @Async를 함께 붙인다."]],
          answer: "옵저버 패턴은 한 객체의 상태 변화를 구독자들에게 자동으로 알리는 패턴입니다. 발행자는 구독자의 구체 동작을 몰라도 되어 결합이 줄어듭니다. 스프링에서는 ApplicationEventPublisher로 이벤트를 발행하고 @EventListener로 받습니다.",
          analogy: "유튜브 채널을 구독하면 새 영상이 올라올 때 알림을 받는 것과 같습니다.",
          followUps: [
            [
              "@EventListener와 @TransactionalEventListener의 차이는요?",
              "@EventListener는 발행 즉시 실행되어 트랜잭션이 롤백돼도 이미 처리될 수 있습니다. @TransactionalEventListener는 트랜잭션의 커밋 이후 같은 단계에 맞춰 실행되어, 확정된 데이터에 대해서만 후속 작업을 합니다."
            ]
          ],
          related: ["cs/jeonryak-paeteon"]
        }
      ]
    },
    {
      name: "아키텍처",
      compare: {
        cols: ["기준", "계층형 아키텍처", "헥사고날 아키텍처"],
        rows: [
          ["의존 방향", "위 → 아래(DB 쪽)", "바깥 → 도메인"],
          ["도메인의 기술 의존", "높음", "낮음"],
          ["구조 복잡도", "단순", "포트·어댑터로 복잡"],
          ["적합한 곳", "CRUD 중심 서비스", "도메인 로직이 복잡한 서비스"]
        ]
      },
      concepts: [
        {
          id: "cs/gyecheunghyeong-akitekcheo",
          slug: "gyecheunghyeong-akitekcheo",
          title: "계층형 아키텍처",
          deep: false,
          def: "애플리케이션을 표현, 응용, 도메인, 인프라 계층으로 나누고 의존이 위에서 아래로만 흐르게 하는 구조다.",
          why: "화면 처리, 비즈니스 로직, 데이터 접근이 한 클래스에 섞이면 변경과 테스트가 어려워지므로, 관심사별로 나눠 의존 방향을 정하기 위해서다.",
          how: [
            "- Presentation(Controller): 요청을 받아 검증하고 응답 DTO로 바꾼다. 비즈니스 로직을 두지 않는다.",
            "- Application(Service): 유스케이스의 흐름을 조율하고 트랜잭션 경계를 가진다.",
            "- Domain: 엔티티와 도메인 규칙. 로직을 도메인 객체 안에 두면 응집도가 높아진다.",
            "- Infrastructure(Repository): DB, 외부 API, 메시지 큐 같은 기술 세부 사항.",
            "단순하고 익숙하지만, 결국 모든 계층이 DB 계층에 의존해 도메인 로직이 JPA 같은 기술에 묶이기 쉽다."
          ],
          use: ["컨트롤러는 요청 검증과 DTO 변환만, 서비스는 트랜잭션과 흐름 조율만 담당하게 나눈다."],
          myth: [
            [
              "서비스 계층에 모든 비즈니스 로직을 넣어야 한다",
              "서비스에 로직이 몰리면 엔티티는 데이터만 담는 빈약한 모델이 된다. 도메인 규칙은 엔티티와 값 객체 안에 두는 것이 응집도가 높다."
            ]
          ],
          answer: "계층형 아키텍처는 표현, 응용, 도메인, 인프라 계층으로 나누고 의존이 위에서 아래로만 흐르게 하는 구조입니다. 단순하고 익숙해 대부분의 스프링 프로젝트가 Controller, Service, Repository로 시작합니다. 다만 도메인이 DB 기술에 묶이기 쉽습니다.",
          followUps: [
            [
              "컨트롤러에서 엔티티를 바로 반환하면 안 되는 이유는요?",
              "API 응답이 엔티티 구조에 묶여 엔티티를 바꾸면 API가 깨지고, 지연 로딩 예외나 양방향 연관관계 순환 참조, 민감 필드 노출 문제가 생깁니다. 응답용 DTO로 변환해 반환합니다."
            ]
          ],
          related: ["cs/heksagonal-akitekcheo", "cs/srp"]
        },
        {
          id: "cs/heksagonal-akitekcheo",
          slug: "heksagonal-akitekcheo",
          title: "헥사고날 아키텍처",
          deep: false,
          def: "도메인을 가운데 두고, 도메인이 정의한 인터페이스(포트)를 바깥 기술(어댑터)이 구현하게 하는 구조로, 포트와 어댑터 아키텍처라고도 한다.",
          why: "도메인 로직이 DB나 웹 프레임워크에 의존하면 기술을 바꾸거나 테스트하기 어려우므로, 외부 기술을 포트와 어댑터 뒤로 밀어내기 위해서다.",
          how: [
            "- 인바운드 포트·어댑터: 웹 컨트롤러, 메시지 리스너가 유스케이스 인터페이스를 호출한다.",
            "- 아웃바운드 포트·어댑터: 도메인이 정의한 `LoadOrderPort`를 JPA 어댑터가 구현한다.",
            "- 모든 의존 방향이 도메인을 향하므로 DB나 프레임워크를 바꿔도 도메인은 영향을 받지 않고, 도메인을 스프링 없이 테스트할 수 있다.",
            "클린 아키텍처도 같은 생각(의존성은 안쪽으로만)을 바탕으로 한다."
          ],
          flow: ["웹 어댑터가 요청 수신", "인바운드 포트(유스케이스) 호출", "도메인 로직 실행", "아웃바운드 포트 호출", "JPA 어댑터가 저장"],
          use: ["주문 도메인이 LoadOrderPort를 정의하고 JPA 어댑터와 외부 API 어댑터가 각각 구현한다."],
          warn: ["작은 CRUD 서비스에 적용하면 클래스와 매핑 코드만 늘어난다. 도메인 로직이 복잡할 때 효과가 크다."],
          answer: "헥사고날 아키텍처는 도메인을 가운데 두고 도메인이 정의한 포트를 바깥 기술의 어댑터가 구현하게 하는 구조입니다. 모든 의존이 도메인을 향해 DB나 프레임워크를 바꿔도 도메인은 영향을 받지 않고, 스프링 없이 도메인을 테스트할 수 있습니다.",
          analogy: "노트북의 USB 포트처럼 규격(포트)만 맞으면 마우스든 키보드든(어댑터) 꽂을 수 있습니다.",
          followUps: [
            [
              "헥사고날 아키텍처는 언제 도입하나요?",
              "도메인 로직이 복잡하고 외부 기술(DB, 메시지, 외부 API)이 자주 바뀌거나 여러 개일 때 효과가 큽니다. 단순한 CRUD 서비스에는 포트와 매핑 코드만 늘어나는 과설계가 될 수 있습니다."
            ]
          ],
          related: ["cs/gyecheunghyeong-akitekcheo", "cs/dip", "cs/eodaepteo-paeteon"]
        },
        {
          id: "cs/ddd-haeksim-yongeo",
          slug: "ddd-haeksim-yongeo",
          title: "DDD 핵심 용어",
          deep: false,
          def: "DDD(도메인 주도 설계)는 비즈니스 도메인의 언어와 규칙을 중심으로 모델과 코드를 설계하는 방법이다.",
          why: "복잡한 도메인에서 개발자와 업무 담당자가 같은 말로 소통하고, 엔티티, 애그리거트 같은 경계로 일관성 규칙을 지키기 위해서다.",
          how: [
            "- 엔티티: 식별자로 구분되는 객체(주문, 회원).",
            "- 값 객체: 값으로만 비교되는 불변 객체(금액, 주소).",
            "- 애그리거트: 함께 일관성을 지켜야 하는 객체 묶음. 루트를 통해서만 수정하며 트랜잭션 경계가 된다.",
            "- 리포지토리: 애그리거트 단위로 저장하고 조회한다.",
            "- 도메인 이벤트: 도메인에서 일어난 중요한 사건(주문 완료).",
            "- 바운디드 컨텍스트: 같은 단어가 같은 의미로 쓰이는 경계. MSA에서 서비스 경계를 나누는 기준이 된다."
          ],
          use: ["주문 애그리거트의 주문 항목은 루트인 Order를 통해서만 추가하고, 트랜잭션은 애그리거트 단위로 묶는다.", "바운디드 컨텍스트를 기준으로 MSA의 서비스 경계를 나눈다."],
          answer: "DDD는 비즈니스 도메인의 언어와 규칙을 중심으로 모델과 코드를 설계하는 방법입니다. 식별자로 구분되는 엔티티, 값으로 비교되는 값 객체, 일관성 경계인 애그리거트, 같은 용어가 같은 의미로 쓰이는 범위인 바운디드 컨텍스트가 핵심 용어입니다.",
          followUps: [
            [
              "애그리거트를 왜 나누나요?",
              "함께 일관성을 지켜야 하는 객체를 하나의 경계로 묶어, 루트를 통해서만 변경하게 하면 불변식을 한곳에서 지킬 수 있습니다. 또 트랜잭션과 저장 단위가 명확해져 락 경합과 결합이 줄어듭니다."
            ]
          ],
          related: ["cs/heksagonal-akitekcheo"]
        }
      ]
    }
  ]
};

export default topic;
