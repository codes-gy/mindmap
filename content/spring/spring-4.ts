import type { Topic } from '../types';

const topic: Topic = {
  key: "spring-4",
  name: "트랜잭션",
  must: [
    "트랜잭션은 ThreadLocal로 스레드에 묶인다. `@Async`로 넘긴 다른 스레드에는 이어지지 않는다.",
    "트랜잭션 안에서 외부 API를 호출하면 그동안 DB 커넥션을 붙잡고 있게 된다. 트랜잭션은 짧게 유지한다.",
    "클래스에 `@Transactional(readOnly = true)`를 두고 쓰기 메서드에만 `@Transactional`을 다시 붙이는 패턴이 흔하다.",
    "커밋이 확정된 뒤 할 일(알림, 메시지 발행)은 `@TransactionalEventListener(phase = AFTER_COMMIT)`로 처리한다."
  ],
  groups: [
    {
      name: "동작 원리",
      compare: {
        cols: ["개념", "역할", "핵심 구성요소", "면접 포인트"],
        rows: [
          ["@Transactional 동작 원리", "AOP 프록시로 트랜잭션 경계 설정", "`TransactionInterceptor`", "프록시 경유 호출만 적용"],
          ["트랜잭션 매니저", "기술별 트랜잭션 API 통일", "`PlatformTransactionManager`", "JPA는 `JpaTransactionManager`"],
          ["트랜잭션 동기화", "같은 커넥션을 스레드에 공유", "`TransactionSynchronizationManager`", "ThreadLocal이라 다른 스레드와 미공유"],
          ["물리 · 논리 트랜잭션", "커넥션 단위 vs 메서드 단위", "물리 1개 + 논리 여러 개", "하나라도 롤백되면 전체 롤백"]
        ]
      },
      concepts: [
        {
          id: "spring/transactional-dongjak-wonri",
          slug: "transactional-dongjak-wonri",
          title: "@Transactional 동작 원리",
          deep: true,
          def: "`@Transactional`이 붙은 빈을 AOP 프록시로 감싸, 메서드 시작 시 트랜잭션을 열고 끝나면 커밋하거나 롤백하는 선언적 트랜잭션 방식이다.",
          why: "서비스 코드마다 커넥션 획득, `setAutoCommit(false)`, commit, rollback, close를 직접 쓰면 비즈니스 로직이 트랜잭션 코드에 묻힌다. 애너테이션 하나로 트랜잭션 경계를 선언하고 실제 처리는 프록시에 맡긴다.",
          how: [
            "컨테이너가 빈을 만들 때 `@Transactional`이 붙은 클래스를 발견하면 원본 대신 CGLIB 프록시를 빈으로 등록한다. 외부에서 메서드를 부르면 프록시의 TransactionInterceptor가 먼저 실행된다.",
            "1) 트랜잭션 매니저가 DataSource에서 커넥션을 얻고 `setAutoCommit(false)`로 트랜잭션을 시작한다.",
            "2) 그 커넥션을 TransactionSynchronizationManager(ThreadLocal)에 보관한다.",
            "3) 원본 메서드를 실행한다. 그 안의 Repository, JdbcTemplate, EntityManager는 같은 스레드의 보관소에서 같은 커넥션을 꺼내 쓴다.",
            "4) 정상 종료면 커밋, 롤백 대상 예외가 나면 롤백한다.",
            "5) 커넥션을 풀에 반납하고 보관소를 비운다.",
            "애너테이션은 메서드 > 클래스 > 인터페이스 순서로 우선 적용된다. 보통 서비스 계층에 둔다."
          ],
          flow: ["프록시가 호출을 가로챔", "커넥션 획득, 자동 커밋 끔", "ThreadLocal에 커넥션 보관", "원본 메서드 실행", "커밋 또는 롤백", "커넥션 반납, 보관소 정리"],
          code: "@Service\n@RequiredArgsConstructor\npublic class OrderService {\n    private final OrderRepository orderRepository;\n    private final StockRepository stockRepository;\n\n    @Transactional\n    public Long order(Long itemId, int qty) {\n        Stock stock = stockRepository.findByItemId(itemId).orElseThrow();\n        stock.decrease(qty);              // 변경 감지로 UPDATE\n        Order order = orderRepository.save(Order.create(itemId, qty));\n        return order.getId();             // 정상 종료 시 커밋\n    }\n}",
          codeLang: "java",
          use: [
            "주문 생성과 재고 차감을 서비스 메서드 하나에 묶어 함께 성공하거나 함께 실패하게 한다.",
            "조회 서비스 클래스에 readOnly 트랜잭션을 두고 쓰기 메서드에만 일반 트랜잭션을 붙인다."
          ],
          warn: [
            "프록시를 거치지 않는 내부 호출(셀프 호출)에는 적용되지 않는다.",
            "private 메서드와 `new`로 만든 객체에는 적용되지 않는다.",
            "트랜잭션 안에서 외부 API를 부르면 응답을 기다리는 동안 커넥션을 붙잡는다. 트랜잭션은 짧게 유지한다."
          ],
          myth: [
            [
              "@Transactional을 붙이면 어떤 메서드든 트랜잭션이 걸린다.",
              "프록시를 거치는 외부 호출에만 적용됩니다. 같은 클래스 안의 호출, private 메서드, new로 만든 객체에는 적용되지 않습니다."
            ],
            ["모든 예외에서 롤백된다.", "기본 규칙은 런타임 예외와 Error만 롤백하고 체크 예외는 커밋합니다."]
          ],
          answer: "@Transactional은 AOP 프록시가 메서드 호출을 가로채 트랜잭션을 시작하고, 정상 종료면 커밋, 런타임 예외면 롤백하는 선언적 트랜잭션입니다. 트랜잭션 매니저가 얻은 커넥션을 ThreadLocal에 보관해 같은 스레드의 데이터 접근 코드가 같은 커넥션을 쓰게 합니다. 프록시 방식이라 셀프 호출과 private 메서드에는 적용되지 않습니다.",
          analogy: "건물 출입구의 경비원과 같습니다. 방(메서드)에 들어갈 때 출입 기록(트랜잭션)을 열고, 나올 때 문제가 없으면 기록을 확정하고 문제가 있으면 없던 일로 돌립니다.",
          qa: [
            "@Transactional은 내부적으로 어떻게 동작하나요?",
            "AOP 프록시가 메서드 호출을 가로채 트랜잭션 매니저로 커넥션을 얻고 자동 커밋을 끈 뒤, 그 커넥션을 ThreadLocal 기반 동기화 매니저에 보관합니다. 같은 스레드의 데이터 접근 코드는 이 커넥션을 공유하고, 메서드가 정상 종료되면 커밋, 런타임 예외가 나면 롤백합니다. 프록시 방식이라 셀프 호출이나 private 메서드에는 적용되지 않습니다."
          ],
          followUps: [
            [
              "@Transactional은 어느 계층에 두는 것이 좋나요?",
              "보통 서비스 계층에 둡니다. 하나의 유스케이스가 여러 Repository 호출로 이뤄지므로 그 단위로 트랜잭션 경계를 잡아야 원자성이 지켜집니다."
            ],
            [
              "클래스와 메서드에 모두 붙이면 무엇이 적용되나요?",
              "더 구체적인 메서드의 설정이 우선합니다. 그래서 클래스에 readOnly = true를 두고 쓰기 메서드에만 @Transactional을 다시 붙이는 패턴이 가능합니다."
            ],
            [
              "트랜잭션 안에서 외부 API를 호출하면 어떤 문제가 있나요?",
              "응답을 기다리는 동안 DB 커넥션과 락을 계속 붙잡아 커넥션 풀이 고갈될 수 있습니다. 외부 호출은 트랜잭션 밖으로 빼거나 커밋 이후 이벤트로 처리합니다."
            ]
          ],
          related: [
            "spring/teuraenjaeksyeon-maenijeo",
            "spring/teuraenjaeksyeon-donggihwa",
            "spring/required",
            "spring/rolbaek-gyuchik"
          ]
        },
        {
          id: "spring/teuraenjaeksyeon-maenijeo",
          slug: "teuraenjaeksyeon-maenijeo",
          title: "트랜잭션 매니저",
          deep: false,
          def: "트랜잭션 시작, 커밋, 롤백을 기술과 상관없이 같은 방식으로 다루게 해 주는 스프링의 트랜잭션 추상화 인터페이스다.",
          why: "JDBC, JPA처럼 기술마다 다른 트랜잭션 API에 서비스 코드가 묶이지 않고, 기술을 바꿔도 같은 코드로 트랜잭션을 다루기 위해서다.",
          how: [
            "JDBC는 `Connection.commit()`, JPA는 `EntityTransaction.commit()`처럼 기술마다 트랜잭션 API가 다르다. 스프링은 `getTransaction()`, `commit()`, `rollback()` 세 메서드로 이를 통일했다.",
            "- DataSourceTransactionManager: JDBC, MyBatis용",
            "- JpaTransactionManager: JPA용. JDBC 작업도 같은 트랜잭션으로 묶어 준다.",
            "- 스프링 부트는 사용하는 기술을 보고 알맞은 구현체를 자동으로 등록한다.",
            "덕분에 데이터 접근 기술을 JDBC에서 JPA로 바꿔도 서비스의 `@Transactional` 코드는 그대로다."
          ],
          use: [
            "JPA와 MyBatis를 함께 쓸 때 JpaTransactionManager 하나로 두 기술의 작업을 같은 트랜잭션에 묶는다.",
            "DB가 둘이면 트랜잭션 매니저를 둘 등록하고 `@Transactional(\"orderTxManager\")`로 골라 쓴다."
          ],
          answer: "PlatformTransactionManager는 트랜잭션 시작, 커밋, 롤백을 기술과 상관없이 같은 방식으로 다루게 해 주는 스프링의 추상화 인터페이스입니다. JDBC는 DataSourceTransactionManager, JPA는 JpaTransactionManager가 구현하며, 부트가 자동으로 등록합니다. 덕분에 데이터 접근 기술을 바꿔도 서비스 코드는 그대로입니다.",
          analogy: "여러 나라 전원 콘센트에 맞춰 주는 만능 어댑터와 같습니다. 기기(서비스 코드)는 그대로 두고 어댑터만 바꿔 끼웁니다.",
          followUps: [
            [
              "JpaTransactionManager가 JDBC 작업도 함께 묶을 수 있는 이유는?",
              "JpaTransactionManager는 EntityManager가 쓰는 JDBC 커넥션을 트랜잭션 동기화 매니저에 함께 등록합니다. 그래서 JdbcTemplate도 같은 커넥션을 꺼내 써 하나의 트랜잭션이 됩니다."
            ]
          ],
          related: ["spring/transactional-dongjak-wonri", "spring/teuraenjaeksyeon-donggihwa"]
        },
        {
          id: "spring/teuraenjaeksyeon-donggihwa",
          slug: "teuraenjaeksyeon-donggihwa",
          title: "트랜잭션 동기화",
          deep: false,
          def: "한 트랜잭션 안의 모든 데이터 접근 코드가 같은 커넥션을 쓰도록, 커넥션을 스레드별 저장소에 보관해 공유하는 메커니즘이다.",
          why: "여러 리포지토리가 각자 커넥션을 얻으면 한 트랜잭션으로 묶이지 않으므로, 커넥션을 파라미터로 넘기지 않고 같은 커넥션을 공유하기 위해서다.",
          how: [
            "트랜잭션은 커넥션 단위로 동작하므로, 서비스가 여러 Repository를 호출해도 모두 같은 커넥션을 써야 하나의 트랜잭션이 된다.",
            "예전에는 커넥션을 파라미터로 계속 넘겨야 했지만, 스프링은 TransactionSynchronizationManager가 ThreadLocal에 커넥션을 보관하고 `DataSourceUtils.getConnection()`이나 EntityManager가 여기서 꺼내 쓴다.",
            "- ThreadLocal 기반이라 같은 스레드 안에서만 공유된다.",
            "- 트랜잭션이 끝나면 보관소를 비워 스레드 재사용 시 섞이지 않게 한다."
          ],
          flow: ["트랜잭션 시작 시 커넥션 획득", "ThreadLocal에 커넥션 저장", "Repository가 같은 커넥션 사용", "종료 시 커밋·롤백", "보관소에서 커넥션 제거"],
          use: ["서비스가 회원 Repository와 주문 Repository를 차례로 호출해도 같은 커넥션으로 하나의 트랜잭션을 유지한다."],
          warn: ["`@Async`나 직접 만든 스레드로 넘어간 작업은 트랜잭션을 공유하지 않는다."],
          answer: "트랜잭션 동기화는 트랜잭션을 시작할 때 얻은 커넥션을 TransactionSynchronizationManager가 ThreadLocal에 보관해, 같은 스레드의 모든 데이터 접근 코드가 같은 커넥션을 쓰게 하는 메커니즘입니다. 커넥션을 파라미터로 넘기지 않아도 여러 Repository가 하나의 트랜잭션으로 묶이는 이유입니다.",
          analogy: "한 사람이 하루 동안 쓰는 개인 사물함과 같습니다. 열쇠(커넥션)를 사물함에 넣어 두면 그 사람이 가는 곳마다 같은 열쇠를 꺼내 씁니다.",
          followUps: [
            [
              "@Async로 넘긴 작업이 트랜잭션에 참여하지 못하는 이유는?",
              "커넥션이 ThreadLocal에 보관되어 있어 다른 스레드에서는 보이지 않기 때문입니다. 비동기 작업은 자기 트랜잭션을 따로 열어야 합니다."
            ]
          ],
          related: ["spring/transactional-dongjak-wonri", "spring/dareun-seuredeueseoui-teuraenjaeksyeon"]
        },
        {
          id: "spring/mulri-nonri-teuraenjaeksyeon",
          slug: "mulri-nonri-teuraenjaeksyeon",
          title: "물리 · 논리 트랜잭션",
          deep: false,
          def: "실제 DB 커넥션 단위의 트랜잭션이 물리 트랜잭션이고, 그 안에 참여한 각 `@Transactional` 메서드 단위가 논리 트랜잭션이다.",
          why: "중첩된 `@Transactional`에서 커밋과 롤백이 언제 실제 DB에 반영되는지 알아야 전파 동작과 롤백 결과를 예측할 수 있기 때문이다.",
          how: [
            "외부 서비스와 내부 서비스가 모두 REQUIRED로 묶이면 물리 트랜잭션은 1개, 논리 트랜잭션은 2개다.",
            "- 원칙: 모든 논리 트랜잭션이 커밋되어야 물리 트랜잭션이 커밋된다.",
            "- 하나라도 롤백되면 물리 트랜잭션 전체가 롤백된다.",
            "- 실제 커밋과 롤백은 처음 트랜잭션을 시작한 신규 트랜잭션만 수행한다. 참여한 내부 트랜잭션의 커밋은 아무 일도 하지 않는다.",
            "이 구분을 알아야 전파 속성과 UnexpectedRollbackException을 이해할 수 있다."
          ],
          use: ["주문 서비스와 결제 서비스가 REQUIRED로 묶였을 때, 결제 실패가 왜 주문 저장까지 되돌리는지 설명할 때 쓴다."],
          answer: "물리 트랜잭션은 실제 DB 커넥션 단위의 트랜잭션이고, 논리 트랜잭션은 그 안에 참여한 각 @Transactional 메서드 단위입니다. 모든 논리 트랜잭션이 커밋되어야 물리 트랜잭션이 커밋되고, 하나라도 롤백되면 전체가 롤백됩니다. 실제 커밋과 롤백은 처음 시작한 신규 트랜잭션만 수행합니다.",
          analogy: "여러 사람이 함께 서명해야 효력이 생기는 계약서와 같습니다. 서명자(논리 트랜잭션) 중 한 명이라도 거부하면 계약(물리 트랜잭션) 전체가 무효가 됩니다.",
          followUps: [
            [
              "내부 트랜잭션이 커밋을 호출해도 실제로 커밋되지 않는 이유는?",
              "내부는 기존 물리 트랜잭션에 참여한 논리 트랜잭션일 뿐이라 커밋 권한이 없습니다. 실제 커밋은 트랜잭션을 처음 시작한 외부가 마지막에 수행합니다."
            ]
          ],
          related: ["spring/required", "spring/unexpectedrollback-yeoe"]
        }
      ]
    },
    {
      name: "전파 속성",
      compare: {
        cols: ["기준", "REQUIRED", "REQUIRES_NEW", "NESTED"],
        rows: [
          ["기존 트랜잭션 있을 때", "참여한다", "보류하고 새로 시작", "세이브포인트 생성"],
          ["기존 트랜잭션 없을 때", "새로 시작", "새로 시작", "새로 시작"],
          ["내부 롤백 시 외부", "함께 롤백", "영향 없음", "외부는 계속 진행 가능"],
          ["외부 롤백 시 내부", "함께 롤백", "이미 커밋되면 유지", "함께 롤백"],
          ["사용 커넥션", "1개 공유", "2개 동시 사용", "1개 공유"]
        ]
      },
      concepts: [
        {
          id: "spring/required",
          slug: "required",
          title: "REQUIRED",
          deep: true,
          def: "기본 전파 속성으로, 진행 중인 트랜잭션이 있으면 그 트랜잭션에 참여하고 없으면 새로 시작한다.",
          why: "주문 저장과 재고 차감처럼 여러 서비스 메서드가 하나의 작업 단위로 함께 성공하거나 함께 실패해야 할 때, 별도 설정 없이 자연스럽게 하나의 트랜잭션으로 묶어 준다.",
          how: [
            "1) 외부 메서드 호출: 진행 중인 트랜잭션이 없으므로 새 물리 트랜잭션을 시작한다(신규 트랜잭션).",
            "2) 내부 메서드 호출: 이미 트랜잭션이 있으므로 같은 커넥션을 쓰며 참여한다.",
            "3) 내부 정상 종료: 참여한 트랜잭션은 실제 커밋을 하지 않는다.",
            "4) 내부에서 예외: 실제 롤백 대신 트랜잭션에 rollback-only 표시를 남긴다.",
            "5) 외부 종료: 신규 트랜잭션인 외부가 최종 커밋한다. rollback-only 표시가 있으면 커밋 대신 롤백하고 예외를 던진다.",
            "즉 참여한 모든 메서드가 성공해야 커밋되는 \"운명 공동체\"가 된다."
          ],
          flow: ["외부 호출: 새 트랜잭션 시작", "내부 호출: 기존 트랜잭션 참여", "내부 예외: rollback-only 표시", "외부 종료: 최종 커밋 시도", "표시 있으면 전체 롤백"],
          code: "@Transactional   // propagation 기본값 REQUIRED\npublic void placeOrder(OrderRequest req) {\n    orderService.save(req);      // 같은 트랜잭션에 참여\n    stockService.decrease(req);  // 예외 시 주문 저장까지 함께 롤백\n}\n\n@Service\nclass StockService {\n    @Transactional(propagation = Propagation.REQUIRED)\n    public void decrease(OrderRequest req) { ... }\n}",
          codeLang: "java",
          use: ["주문 저장, 재고 차감, 포인트 적립을 각각의 서비스로 나누되 하나의 트랜잭션으로 묶는다.", "대부분의 서비스 메서드는 기본값인 REQUIRED 그대로 쓴다."],
          warn: [
            "내부에서 난 예외를 외부가 catch해도 rollback-only 표시 때문에 전체가 롤백되고 UnexpectedRollbackException이 난다.",
            "같은 클래스 안의 호출은 전파 속성과 상관없이 프록시를 거치지 않는다."
          ],
          myth: [
            [
              "내부 메서드에서 난 예외를 외부에서 catch하면 외부는 커밋된다.",
              "내부가 rollback-only 표시를 남기므로 외부가 예외를 잡아도 커밋 시점에 전체가 롤백되고 UnexpectedRollbackException이 발생합니다."
            ]
          ],
          answer: "REQUIRED는 기본 전파 속성으로, 진행 중인 트랜잭션이 있으면 참여하고 없으면 새로 시작합니다. 참여한 메서드들은 하나의 물리 트랜잭션으로 묶여 하나라도 실패하면 전체가 롤백됩니다. 여러 작업을 하나의 단위로 묶을 때 별도 설정 없이 쓰는 속성입니다.",
          analogy: "한 배에 탄 사람들과 같습니다. 누구 한 명이 배에 구멍을 내면 모두 함께 가라앉습니다.",
          qa: [
            "REQUIRED와 REQUIRES_NEW의 차이는?",
            "REQUIRED는 기존 트랜잭션이 있으면 참여해 하나의 물리 트랜잭션으로 묶이므로, 내부가 실패하면 외부까지 모두 롤백됩니다. REQUIRES_NEW는 기존 트랜잭션을 보류하고 새 커넥션으로 독립된 트랜잭션을 열어, 내부가 롤백돼도 외부는 커밋될 수 있습니다. 실패 이력처럼 반드시 남겨야 하는 작업에 REQUIRES_NEW를 씁니다."
          ],
          followUps: [
            [
              "내부 서비스의 실패를 외부와 분리하려면 어떻게 하나요?",
              "내부를 REQUIRES_NEW로 바꿔 독립된 트랜잭션으로 실행하고, 외부에서 그 예외를 catch합니다. 또는 실패 가능성을 미리 검사해 예외 자체를 피합니다."
            ],
            [
              "REQUIRED 메서드를 트랜잭션 없이 호출하면 어떻게 되나요?",
              "진행 중인 트랜잭션이 없으므로 그 메서드가 새 트랜잭션을 시작하는 신규 트랜잭션이 되고, 끝날 때 직접 커밋하거나 롤백합니다."
            ]
          ],
          related: ["spring/requires-new", "spring/mulri-nonri-teuraenjaeksyeon", "spring/unexpectedrollback-yeoe"]
        },
        {
          id: "spring/requires-new",
          slug: "requires-new",
          title: "REQUIRES_NEW",
          deep: true,
          def: "항상 새 트랜잭션을 시작하고, 진행 중이던 트랜잭션은 끝날 때까지 잠시 보류한다.",
          why: "주문 처리가 실패해 롤백되더라도 \"실패 이력\"이나 감사 로그는 반드시 남겨야 할 때처럼, 바깥 트랜잭션의 결과와 독립적으로 커밋해야 하는 작업에 쓴다.",
          how: [
            "1) 외부 트랜잭션이 진행 중일 때 REQUIRES_NEW 메서드가 호출된다.",
            "2) 외부 트랜잭션의 커넥션과 동기화 정보를 보관소에서 떼어 내 잠시 보류(suspend)한다.",
            "3) 커넥션 풀에서 새 커넥션을 얻어 새 물리 트랜잭션을 시작한다.",
            "4) 내부 메서드가 끝나면 이 트랜잭션만 독립적으로 커밋하거나 롤백한다.",
            "5) 보류했던 외부 트랜잭션을 복원(resume)해 이어서 진행한다."
          ],
          flow: ["외부 트랜잭션 진행 중", "외부 커넥션 보류(suspend)", "새 커넥션으로 트랜잭션 시작", "내부만 독립 커밋·롤백", "외부 트랜잭션 복원(resume)"],
          code: "@Service\n@RequiredArgsConstructor\npublic class OrderFacade {\n    private final OrderService orderService;\n    private final FailLogService failLogService;\n\n    @Transactional\n    public void order(OrderRequest req) {\n        try {\n            orderService.place(req);\n        } catch (PaymentException e) {\n            failLogService.save(req.orderId(), e.getMessage());  // 별도 커밋\n            throw e;\n        }\n    }\n}\n\n@Service\nclass FailLogService {\n    @Transactional(propagation = Propagation.REQUIRES_NEW)\n    public void save(Long orderId, String reason) { ... }\n}",
          codeLang: "java",
          use: ["결제가 실패해 주문이 롤백되어도 결제 실패 이력은 별도로 커밋한다.", "감사(audit) 로그를 본 트랜잭션 결과와 무관하게 저장한다."],
          warn: [
            "같은 클래스 안에서 호출하면 프록시를 거치지 않아 새 트랜잭션이 열리지 않는다. 별도 빈으로 분리한다.",
            "한 요청이 커넥션 2개를 동시에 쓴다. 동시 요청이 많으면 커넥션 풀이 고갈되어 서로 기다리는 교착 상태가 생길 수 있다.",
            "내부에서 던진 예외를 외부가 잡지 않으면 외부 트랜잭션도 롤백된다."
          ],
          myth: [
            [
              "REQUIRES_NEW를 쓰면 내부 예외가 외부에 영향을 주지 않는다.",
              "트랜잭션은 분리되지만 예외 자체는 호출 스택을 따라 외부로 전파됩니다. 외부에서 catch하지 않으면 외부 트랜잭션도 롤백됩니다."
            ]
          ],
          answer: "REQUIRES_NEW는 진행 중인 트랜잭션을 잠시 보류하고 항상 새 커넥션으로 독립된 트랜잭션을 시작합니다. 내부가 롤백돼도 외부는 커밋될 수 있고, 그 반대도 마찬가지라 실패 이력이나 감사 로그처럼 반드시 남겨야 하는 작업에 씁니다. 다만 커넥션을 동시에 두 개 쓰므로 커넥션 풀 고갈에 주의해야 합니다.",
          analogy: "본 회의 도중 잠시 나와 별도의 짧은 회의를 열고 결론을 내는 것과 같습니다. 본 회의가 결렬되어도 별도 회의의 결정은 그대로 남습니다.",
          qa: [
            "REQUIRES_NEW는 언제 쓰고 무엇을 주의해야 하나요?",
            "외부 트랜잭션이 롤백되더라도 반드시 커밋되어야 하는 로그나 이력 저장에 씁니다. 기존 트랜잭션을 보류하고 새 커넥션으로 독립된 트랜잭션을 열기 때문에 결과가 서로 영향을 주지 않습니다. 다만 커넥션을 동시에 두 개 쓰므로 풀 고갈에 주의해야 하고, 셀프 호출에서는 적용되지 않습니다."
          ],
          followUps: [
            [
              "REQUIRES_NEW가 커넥션 풀 데드락을 일으킬 수 있는 이유는?",
              "요청 하나가 외부 커넥션을 쥔 채 새 커넥션을 기다립니다. 동시 요청이 풀 크기만큼 몰리면 모두 두 번째 커넥션을 기다리며 아무도 반납하지 못해 멈출 수 있습니다."
            ],
            [
              "같은 클래스 안에서 REQUIRES_NEW 메서드를 부르면 어떻게 되나요?",
              "프록시를 거치지 않아 전파 속성이 무시되고 외부 트랜잭션 안에서 그냥 실행됩니다. 별도 빈으로 분리해야 합니다."
            ],
            [
              "NESTED와는 어떻게 다른가요?",
              "NESTED는 같은 커넥션에 세이브포인트를 만들어 외부가 롤백되면 내부도 롤백됩니다. REQUIRES_NEW는 완전히 독립된 트랜잭션이라 내부가 먼저 커밋되면 외부 롤백과 무관하게 남습니다."
            ]
          ],
          related: ["spring/required", "spring/nested", "spring/mulri-nonri-teuraenjaeksyeon"]
        },
        {
          id: "spring/nested",
          slug: "nested",
          title: "NESTED",
          deep: false,
          def: "진행 중인 트랜잭션 안에 세이브포인트를 만들어, 내부 작업만 세이브포인트까지 부분 롤백할 수 있게 한다.",
          why: "외부 트랜잭션은 유지하면서 내부 작업 실패만 부분 롤백하고 나머지 작업은 계속 진행하기 위해서다.",
          how: [
            "- 외부 트랜잭션이 없으면 REQUIRED처럼 새로 시작한다.",
            "- 내부가 롤백되면 세이브포인트 이후 변경만 취소되고 외부는 계속 진행할 수 있다.",
            "- 외부가 롤백되면 내부 변경도 함께 롤백된다. 이 점이 REQUIRES_NEW와 다르다.",
            "- 같은 커넥션을 쓰므로 커넥션을 추가로 쓰지 않는다."
          ],
          use: ["대량 등록 중 일부 행이 실패해도 그 행만 세이브포인트로 되돌리고 나머지는 계속 처리한다(JDBC 환경)."],
          warn: ["JDBC 세이브포인트를 쓰므로 DataSourceTransactionManager에서만 동작한다. JPA(JpaTransactionManager)에서는 지원되지 않는다."],
          answer: "NESTED는 진행 중인 트랜잭션 안에 세이브포인트를 만들어 내부 작업만 부분 롤백할 수 있게 합니다. 내부가 실패해도 외부는 계속 진행할 수 있지만, 외부가 롤백되면 내부도 함께 롤백됩니다. JDBC 세이브포인트를 쓰므로 JPA에서는 지원되지 않습니다.",
          analogy: "게임의 중간 저장 지점과 같습니다. 중간에 실패하면 저장 지점으로만 돌아가지만, 게임 전체를 포기하면 저장 지점도 함께 사라집니다.",
          followUps: [
            [
              "JPA에서 NESTED를 쓰면 어떻게 되나요?",
              "JpaTransactionManager는 세이브포인트를 지원하지 않아 NestedTransactionNotSupportedException이 발생합니다. JPA에서는 REQUIRES_NEW나 로직 분리로 대신합니다."
            ]
          ],
          related: ["spring/requires-new", "spring/required"]
        },
        {
          id: "spring/supports",
          slug: "supports",
          title: "SUPPORTS",
          deep: false,
          def: "진행 중인 트랜잭션이 있으면 참여하고, 없으면 트랜잭션 없이 실행한다.",
          why: "단순 조회처럼 트랜잭션이 꼭 필요하지 않은 메서드가 호출한 쪽의 트랜잭션 유무에 맞춰 유연하게 동작하게 하기 위해서다.",
          how: [
            "트랜잭션이 꼭 필요하지는 않지만, 호출한 쪽에 트랜잭션이 있다면 같은 커넥션과 영속성 컨텍스트를 공유하는 편이 좋은 조회 로직에 쓴다.",
            "- 트랜잭션 없이 실행되면 각 쿼리가 자동 커밋으로 실행된다.",
            "- 쓰임 예: 단독으로 호출되면 트랜잭션 없이 가볍게 조회하고, 주문 트랜잭션 안에서 호출되면 같은 영속성 컨텍스트에서 방금 저장한 데이터를 보게 할 때 쓴다.",
            "- 트랜잭션 없이 실행되더라도 스프링은 기본으로 트랜잭션 동기화를 켜 두어, 메서드 안에서는 같은 커넥션과 EntityManager를 공유한다.",
            "- 주의: 트랜잭션 없이 실행될 때 변경 감지로 수정한 값은 커밋 시점이 없어 DB에 반영되지 않는다."
          ],
          use: ["단독으로도 호출되고 다른 트랜잭션 안에서도 호출되는 공통 조회 메서드에 붙인다."],
          answer: "SUPPORTS는 진행 중인 트랜잭션이 있으면 참여하고, 없으면 트랜잭션 없이 실행합니다. 트랜잭션이 꼭 필요하지는 않지만 호출한 쪽에 트랜잭션이 있다면 같은 커넥션과 영속성 컨텍스트를 공유하고 싶은 조회 로직에 씁니다.",
          followUps: [
            [
              "SUPPORTS로 트랜잭션 없이 실행되면 쓰기는 어떻게 되나요?",
              "각 SQL이 자동 커밋으로 바로 반영되어 여러 쓰기를 하나로 묶을 수 없습니다. 쓰기가 있는 메서드에는 맞지 않습니다."
            ]
          ],
          related: ["spring/required", "spring/not-supported"]
        },
        {
          id: "spring/mandatory",
          slug: "mandatory",
          title: "MANDATORY",
          deep: false,
          def: "반드시 진행 중인 트랜잭션 안에서만 호출되어야 하며, 없으면 `IllegalTransactionStateException`을 던진다.",
          why: "반드시 상위 트랜잭션 안에서 실행되어야 하는 메서드가 단독으로 호출되는 실수를 즉시 예외로 드러내기 위해서다.",
          how: [
            "혼자 실행되면 데이터 정합성이 깨지는 메서드를 보호할 때 쓴다. 예를 들어 반드시 주문 트랜잭션의 일부로만 실행되어야 하는 재고 차감 메서드에 붙여, 실수로 단독 호출하는 것을 막는다.",
            "- 동작: 진행 중인 트랜잭션이 있으면 REQUIRED처럼 참여하고, 없으면 메서드를 실행하지 않고 바로 예외를 던진다.",
            "- 장점: \"이 메서드는 상위 트랜잭션의 일부\"라는 설계 의도를 코드로 드러내고, 실수를 운영이 아니라 테스트에서 바로 발견하게 한다.",
            "- 참여한 상태에서 런타임 예외가 나면 바깥 트랜잭션 전체가 rollback-only로 표시된다."
          ],
          use: ["주문 트랜잭션의 일부로만 실행되어야 하는 재고 차감 메서드에 붙여 단독 호출을 막는다."],
          answer: "MANDATORY는 반드시 진행 중인 트랜잭션 안에서만 호출되어야 하며, 트랜잭션이 없으면 IllegalTransactionStateException을 던집니다. 혼자 실행되면 정합성이 깨지는 메서드를 실수로 단독 호출하지 못하게 막는 안전장치입니다.",
          followUps: [
            [
              "MANDATORY 대신 REQUIRED를 쓰면 어떤 차이가 있나요?",
              "REQUIRED는 트랜잭션이 없으면 새로 시작해 조용히 단독 실행됩니다. MANDATORY는 이런 잘못된 호출을 예외로 즉시 드러냅니다."
            ]
          ],
          related: ["spring/required", "spring/never"]
        },
        {
          id: "spring/not-supported",
          slug: "not-supported",
          title: "NOT_SUPPORTED",
          deep: false,
          def: "진행 중인 트랜잭션을 보류하고, 트랜잭션 없이 실행한다.",
          why: "외부 API 호출처럼 트랜잭션이 필요 없는 오래 걸리는 작업이 DB 커넥션과 트랜잭션을 붙잡고 있지 않게 하기 위해서다.",
          how: [
            "트랜잭션 안에서 실행할 필요가 없고 오래 걸리는 작업(대용량 조회, 외부 시스템 호출)이 외부 트랜잭션의 락이나 커넥션을 오래 붙잡지 않게 할 때 쓴다.",
            "- 메서드가 끝나면 보류했던 트랜잭션을 다시 이어 간다.",
            "- 쓰임 예: 주문 트랜잭션 안에서 리포트용 대용량 조회를 해야 할 때, 그 조회가 트랜잭션의 락이나 스냅샷에 묶이지 않게 분리한다.",
            "- 주의: 보류된 바깥 트랜잭션도 커넥션을 계속 쥐고 있어, 안쪽에서 쿼리를 실행하면 커넥션을 하나 더 쓴다. 동시 요청이 많으면 커넥션 풀 고갈에 주의한다.",
            "- 안쪽에서 예외를 잡아 처리하면 보류된 바깥 트랜잭션은 영향을 받지 않는다."
          ],
          use: ["트랜잭션 도중 호출하는 대용량 통계 조회를 트랜잭션 밖에서 실행해 락 경합을 줄인다."],
          answer: "NOT_SUPPORTED는 진행 중인 트랜잭션을 보류하고 트랜잭션 없이 실행한 뒤, 끝나면 보류한 트랜잭션을 다시 이어 갑니다. 트랜잭션이 필요 없고 오래 걸리는 작업이 외부 트랜잭션의 락이나 커넥션을 오래 붙잡지 않게 할 때 씁니다.",
          followUps: [
            [
              "NOT_SUPPORTED로 실행되는 동안 외부 트랜잭션의 커넥션은 어떻게 되나요?",
              "외부 커넥션은 보류된 채 계속 점유되고, 내부 작업은 필요하면 별도 커넥션을 씁니다. 커넥션 사용량이 늘 수 있다는 점은 REQUIRES_NEW와 비슷합니다."
            ]
          ],
          related: ["spring/supports", "spring/requires-new"]
        },
        {
          id: "spring/never",
          slug: "never",
          title: "NEVER",
          deep: false,
          def: "트랜잭션 없이 실행되어야 하며, 진행 중인 트랜잭션이 있으면 `IllegalTransactionStateException`을 던진다.",
          why: "트랜잭션 안에서 실행되면 안 되는 작업이 실수로 트랜잭션 안에서 호출되는 것을 예외로 막기 위해서다.",
          how: [
            "트랜잭션 안에서 호출되면 안 되는 작업을 명시적으로 막을 때 쓴다. 실무에서는 거의 쓰지 않는다.",
            "- MANDATORY의 반대다. 트랜잭션이 없으면 그대로 실행하고, 있으면 메서드를 실행하지 않고 예외를 던진다.",
            "- 쓰임 예: 외부 메시지 발행이나 긴 파일 처리처럼 트랜잭션 안에서 실행되면 락과 커넥션을 오래 잡는 작업이 실수로 트랜잭션 안에서 호출되는 것을 막는다.",
            "- 단순히 트랜잭션 밖에서 실행만 하고 싶다면 예외 없이 보류하는 NOT_SUPPORTED를 쓴다."
          ],
          use: ["트랜잭션 안에서 실행되면 락을 오래 잡는 배치성 작업을 트랜잭션 밖에서만 호출하도록 강제한다."],
          answer: "NEVER는 트랜잭션 없이 실행되어야 하며, 진행 중인 트랜잭션이 있으면 IllegalTransactionStateException을 던집니다. 트랜잭션 안에서 호출되면 안 되는 작업을 명시적으로 막을 때 쓰며 실무에서는 거의 쓰지 않습니다.",
          followUps: [
            [
              "NEVER와 NOT_SUPPORTED의 차이는?",
              "둘 다 트랜잭션 없이 실행하지만, NOT_SUPPORTED는 기존 트랜잭션을 보류하고 실행하는 반면 NEVER는 기존 트랜잭션이 있으면 예외를 던집니다."
            ]
          ],
          related: ["spring/mandatory"]
        }
      ]
    },
    {
      name: "격리 수준",
      compare: {
        cols: ["기준", "READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"],
        rows: [
          ["Dirty Read", "발생", "방지", "방지", "방지"],
          ["Non-Repeatable Read", "발생", "발생", "방지", "방지"],
          ["Phantom Read", "발생", "발생", "가능(InnoDB는 대부분 방지)", "방지"],
          ["동시성", "가장 높음", "높음", "보통", "가장 낮음"],
          ["기본값인 DB", "없음", "PostgreSQL, Oracle", "MySQL InnoDB", "없음"]
        ]
      },
      concepts: [
        {
          id: "spring/read-uncommitted",
          slug: "read-uncommitted",
          title: "READ UNCOMMITTED",
          deep: false,
          def: "다른 트랜잭션이 커밋하지 않은 변경까지 읽을 수 있는 가장 낮은 격리 수준이다.",
          why: "롤백될 수도 있는 값을 읽는 Dirty Read가 왜 위험한지 알고, 격리 수준 선택의 기준점을 잡기 위해서다.",
          how: [
            "- Dirty Read가 발생한다. A가 잔액을 바꾸고 커밋하기 전에 B가 그 값을 읽었는데 A가 롤백하면, B는 존재한 적 없는 값을 근거로 작업한 셈이 된다.",
            "- Non-Repeatable Read, Phantom Read도 모두 발생한다.",
            "- 정합성 문제가 커서 실무에서는 거의 쓰지 않는다."
          ],
          use: ["정확도가 중요하지 않은 대략적인 모니터링 집계에서 락 없이 빠르게 읽을 때 드물게 쓴다."],
          answer: "READ UNCOMMITTED는 다른 트랜잭션이 커밋하지 않은 변경까지 읽는 가장 낮은 격리 수준입니다. Dirty Read, Non-Repeatable Read, Phantom Read가 모두 발생해 정합성 문제가 커서 실무에서는 거의 쓰지 않습니다.",
          analogy: "아직 결재되지 않은 초안 문서를 보고 업무를 진행하는 것과 같습니다. 초안이 폐기되면 존재하지 않는 내용으로 일한 셈이 됩니다.",
          followUps: [
            [
              "Dirty Read가 왜 위험한가요?",
              "상대 트랜잭션이 롤백하면 실제로는 존재하지 않은 값을 근거로 계산하거나 저장하게 되어 데이터가 잘못된 채 확정될 수 있기 때문입니다."
            ]
          ],
          related: ["spring/read-committed"]
        },
        {
          id: "spring/read-committed",
          slug: "read-committed",
          title: "READ COMMITTED",
          deep: false,
          def: "커밋된 데이터만 읽는 격리 수준으로, PostgreSQL과 Oracle의 기본값이다.",
          why: "커밋되지 않은 데이터를 읽는 문제를 막으면서도 동시성을 크게 떨어뜨리지 않기 위해서다.",
          how: [
            "- Dirty Read는 막는다.",
            "- Non-Repeatable Read가 발생한다. 같은 행을 두 번 읽는 사이 다른 트랜잭션이 수정·커밋하면 두 번째 조회 값이 달라진다.",
            "- MVCC 기반 DB는 쿼리(문장)마다 새 스냅샷을 만들어, 매번 그 시점까지 커밋된 최신 값을 읽는다.",
            "`@Transactional(isolation = Isolation.READ_COMMITTED)`처럼 지정하고, 기본값(DEFAULT)은 DB 설정을 따른다."
          ],
          use: ["대부분의 일반 웹 서비스가 PostgreSQL 기본값인 READ COMMITTED로 충분한 정합성과 동시성을 얻는다."],
          answer: "READ COMMITTED는 커밋된 데이터만 읽는 격리 수준으로 PostgreSQL과 Oracle의 기본값입니다. Dirty Read는 막지만, 같은 행을 두 번 읽는 사이 다른 트랜잭션이 커밋하면 값이 달라지는 Non-Repeatable Read가 발생합니다. MVCC 기반 DB는 쿼리마다 새 스냅샷을 읽습니다.",
          analogy: "결재가 끝난 문서만 보지만, 다시 열어 볼 때마다 최신 결재본으로 바뀌어 있을 수 있는 것과 같습니다.",
          followUps: [
            [
              "READ COMMITTED에서 Non-Repeatable Read가 생기는 이유는?",
              "MVCC 기반 DB가 쿼리(문장)를 실행할 때마다 새 스냅샷을 만들기 때문에, 두 쿼리 사이에 커밋된 변경이 두 번째 쿼리에는 보이기 때문입니다."
            ]
          ],
          related: ["spring/read-uncommitted", "spring/repeatable-read"]
        },
        {
          id: "spring/repeatable-read",
          slug: "repeatable-read",
          title: "REPEATABLE READ",
          deep: false,
          def: "트랜잭션 안에서 같은 행은 몇 번을 읽어도 같은 값을 보장하는 격리 수준으로, MySQL InnoDB의 기본값이다.",
          why: "한 트랜잭션 안에서 같은 데이터를 다시 읽을 때 값이 바뀌는 Non-Repeatable Read를 막기 위해서다.",
          how: [
            "- 트랜잭션의 첫 조회 시점 스냅샷을 끝까지 읽어 Non-Repeatable Read를 막는다.",
            "- 이론상 범위 조회에 새 행이 나타나는 Phantom Read가 가능하다.",
            "- MySQL InnoDB는 일반 조회는 MVCC 스냅샷으로, `SELECT ... FOR UPDATE` 같은 잠금 읽기는 갭 락과 넥스트 키 락으로 대부분의 팬텀을 막는다."
          ],
          use: ["정산처럼 트랜잭션 안에서 같은 데이터를 여러 번 읽어 일관된 결과가 필요한 작업에 쓴다."],
          myth: [
            [
              "REPEATABLE READ에서는 UPDATE도 스냅샷 값을 기준으로 한다.",
              "UPDATE와 SELECT ... FOR UPDATE는 스냅샷이 아니라 최신 커밋 데이터를 읽고 락을 거는 잠금 읽기입니다. 그래서 일반 조회 결과와 다를 수 있습니다."
            ]
          ],
          answer: "REPEATABLE READ는 트랜잭션 안에서 같은 행을 몇 번 읽어도 같은 값을 보장하는 격리 수준으로 MySQL InnoDB의 기본값입니다. 트랜잭션의 첫 조회 시점 스냅샷을 끝까지 읽어 Non-Repeatable Read를 막습니다. 이론상 Phantom Read가 가능하지만 InnoDB는 MVCC와 넥스트 키 락으로 대부분 막습니다.",
          analogy: "시험 시작 때 나눠 준 문제지를 끝까지 보는 것과 같습니다. 도중에 출제자가 문제를 고쳐도 내 문제지는 바뀌지 않습니다.",
          followUps: [
            [
              "MySQL은 REPEATABLE READ에서 팬텀을 어떻게 막나요?",
              "일반 조회는 MVCC 스냅샷으로, 잠금 읽기는 갭 락과 넥스트 키 락으로 범위에 새 행이 끼어드는 것을 막습니다."
            ]
          ],
          related: ["spring/read-committed", "spring/serializable"]
        },
        {
          id: "spring/serializable",
          slug: "serializable",
          title: "SERIALIZABLE",
          deep: false,
          def: "트랜잭션들을 순서대로 하나씩 실행한 것과 같은 결과를 보장하는 가장 높은 격리 수준이다.",
          why: "정합성이 무엇보다 중요할 때 동시 실행으로 생기는 모든 이상 현상을 막되, 그 대가로 동시성이 크게 떨어진다는 점을 알기 위해서다.",
          how: [
            "- Dirty Read, Non-Repeatable Read, Phantom Read를 모두 막는다.",
            "- MySQL은 일반 SELECT도 공유 락을 걸어, 읽은 행을 다른 트랜잭션이 수정하지 못하게 한다.",
            "- 락 경합과 대기가 크게 늘어 동시 처리 성능이 가장 낮다. 정합성이 극도로 중요하고 동시성이 낮은 작업에만 쓴다."
          ],
          use: ["동시 요청이 적고 정합성이 절대적인 소규모 관리 작업에 제한적으로 쓴다."],
          answer: "SERIALIZABLE은 트랜잭션들을 하나씩 순서대로 실행한 것과 같은 결과를 보장하는 가장 높은 격리 수준입니다. 모든 이상 현상을 막지만 MySQL에서는 일반 SELECT도 공유 락을 걸어 락 경합이 커지고 동시성이 가장 낮습니다.",
          analogy: "은행 창구가 하나뿐이라 손님이 한 명씩만 처리되는 것과 같습니다. 실수는 없지만 줄이 길어집니다.",
          followUps: [
            [
              "정합성이 중요하면 SERIALIZABLE을 쓰면 되지 않나요?",
              "전체 처리량이 크게 떨어지고 데드락과 대기가 늘어납니다. 보통은 기본 격리 수준을 유지하고 필요한 지점에만 비관적 락이나 낙관적 락을 겁니다."
            ]
          ],
          related: ["spring/repeatable-read"]
        }
      ]
    },
    {
      name: "롤백 규칙",
      compare: {
        cols: ["기준", "롤백 규칙", "rollbackFor 옵션", "setRollbackOnly"],
        rows: [
          ["롤백 트리거", "언체크 예외·`Error`", "지정한 예외 타입", "명시적 호출"],
          ["예외 전파", "필요", "필요", "불필요 (정상 반환 가능)"],
          ["설정 위치", "기본 동작 (설정 없음)", "`@Transactional` 속성", "메서드 본문 코드"],
          ["대표 쓰임", "일반 비즈니스 예외", "체크 예외도 롤백", "예외 없이 실패 처리"]
        ]
      },
      concepts: [
        {
          id: "spring/rolbaek-gyuchik",
          slug: "rolbaek-gyuchik",
          title: "롤백 규칙",
          deep: true,
          def: "스프링은 기본적으로 언체크 예외(`RuntimeException`과 하위)와 `Error`가 나면 롤백하고, 체크 예외는 커밋한다.",
          why: "모든 예외에서 롤백하면 \"잔액 부족이라 결제는 실패했지만 주문은 결제 대기로 남긴다\" 같은 비즈니스 흐름을 표현할 수 없다. 스프링은 체크 예외를 호출자가 처리할 수 있는 비즈니스 예외, 언체크 예외를 복구 불가능한 시스템 예외로 보는 관례를 따른다.",
          how: [
            "1) 프록시가 원본 메서드를 실행하다 예외를 잡는다.",
            "2) 예외 타입을 롤백 규칙과 비교한다. 기본 규칙은 `RuntimeException`과 `Error`.",
            "3) 롤백 대상이면 롤백, 아니면 커밋한 뒤 예외를 그대로 호출자에게 다시 던진다.",
            "- `rollbackFor`, `noRollbackFor`로 규칙을 바꿀 수 있다.",
            "- 예외를 메서드 안에서 catch해 삼키면 프록시는 예외를 보지 못해 커밋한다.",
            "이 규칙은 EJB 시절의 관례를 이어받은 것이다. 실무에서는 비즈니스 예외도 대부분 언체크로 만들어 기본 규칙만으로 롤백되게 한다."
          ],
          flow: ["원본 메서드에서 예외 발생", "프록시가 예외를 잡음", "롤백 규칙과 예외 타입 비교", "대상이면 롤백, 아니면 커밋", "예외를 호출자에게 다시 던짐"],
          code: "@Transactional\npublic void pay(Long orderId) throws InsufficientBalanceException {\n    Order order = orderRepository.findById(orderId).orElseThrow();\n    order.markWaiting();\n    if (!wallet.hasEnough(order.getPrice())) {\n        // 체크 예외: 기본 규칙으로는 커밋된다 (주문은 결제 대기로 남음)\n        throw new InsufficientBalanceException();\n    }\n}\n\n@Transactional(rollbackFor = Exception.class)   // 체크 예외도 롤백\npublic void importFile(Path path) throws IOException { ... }",
          codeLang: "java",
          use: [
            "파일 업로드 중 IOException 같은 체크 예외에도 롤백하도록 `rollbackFor = Exception.class`를 지정한다.",
            "비즈니스 예외를 RuntimeException으로 만들어 기본 규칙만으로 롤백되게 한다."
          ],
          warn: [
            "`throws Exception`으로 선언된 체크 예외는 롤백되지 않는다. 의도와 다르면 `rollbackFor`를 지정한다.",
            "catch 블록에서 로그만 남기고 끝내면 커밋된다. 롤백이 필요하면 예외를 다시 던지거나 rollback-only로 표시한다."
          ],
          myth: [["예외가 나면 무조건 롤백된다.", "체크 예외는 기본적으로 커밋됩니다. 또 예외를 catch하고 다시 던지지 않으면 프록시는 예외를 보지 못해 커밋합니다."]],
          answer: "스프링은 기본적으로 런타임 예외와 Error가 발생하면 롤백하고 체크 예외는 커밋합니다. 체크 예외는 호출자가 복구할 수 있는 비즈니스 예외로 보는 관례 때문이며, rollbackFor와 noRollbackFor로 바꿀 수 있습니다. 예외를 catch해 삼키면 프록시가 정상 종료로 보고 커밋합니다.",
          analogy: "보험 약관과 같습니다. 약관에 적힌 사고(런타임 예외)만 보상(롤백)하고, 그 외의 일은 특약(rollbackFor)을 추가해야 보상받습니다.",
          qa: [
            "체크 예외가 발생하면 롤백되나요?",
            "기본 설정에서는 롤백되지 않고 커밋됩니다. 스프링은 런타임 예외와 Error만 롤백 대상으로 보고, 체크 예외는 호출자가 복구할 수 있는 비즈니스 예외로 간주하기 때문입니다. 체크 예외에도 롤백하려면 rollbackFor = Exception.class처럼 지정합니다."
          ],
          followUps: [
            [
              "스프링이 체크 예외를 커밋하는 이유는?",
              "EJB 시절부터의 관례로, 체크 예외는 잔액 부족처럼 비즈니스적으로 의미 있고 호출자가 대응할 수 있는 예외라고 보기 때문입니다. 그 상태 자체를 저장해야 하는 경우가 있습니다."
            ],
            [
              "catch한 뒤에도 롤백하려면 어떻게 하나요?",
              "예외를 다시 던지거나 TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()로 롤백 표시를 남깁니다. 보통은 다시 던지는 쪽이 더 명확합니다."
            ]
          ],
          related: ["spring/rollbackfor-opsyeon", "spring/setrollbackonly", "spring/transactional-dongjak-wonri"]
        },
        {
          id: "spring/rollbackfor-opsyeon",
          slug: "rollbackfor-opsyeon",
          title: "rollbackFor 옵션",
          deep: false,
          def: "`@Transactional`의 기본 롤백 규칙을 예외 타입별로 바꾸는 속성이다.",
          why: "기본적으로 체크 예외는 커밋되므로, 체크 예외가 나도 롤백해야 하는 경우를 명시하기 위해서다.",
          how: [
            "- `rollbackFor = IOException.class`: 지정한 체크 예외와 하위 예외도 롤백한다.",
            "- `noRollbackFor = NotificationException.class`: 런타임 예외라도 지정한 예외는 커밋한다. 알림 실패처럼 부가 작업의 실패가 본 작업을 되돌리면 안 될 때 쓴다.",
            "- 규칙이 겹치면 예외 계층에서 더 가까운 규칙이 이긴다."
          ],
          use: [
            "외부 파일 처리 메서드에 `rollbackFor = IOException.class`를 붙인다.",
            "알림 발송 실패 예외는 `noRollbackFor`로 지정해 주문은 커밋되게 한다."
          ],
          answer: "rollbackFor는 지정한 예외가 나면 롤백하도록, noRollbackFor는 지정한 예외가 나도 커밋하도록 기본 롤백 규칙을 바꾸는 속성입니다. 체크 예외에도 롤백이 필요하거나, 부가 작업의 런타임 예외가 본 작업을 되돌리면 안 될 때 씁니다.",
          followUps: [["rollbackFor와 noRollbackFor가 겹치면 어떻게 되나요?", "예외 계층에서 발생한 예외 타입과 더 가까운 규칙이 우선 적용됩니다."]],
          related: ["spring/rolbaek-gyuchik"]
        },
        {
          id: "spring/setrollbackonly",
          slug: "setrollbackonly",
          title: "setRollbackOnly",
          deep: false,
          def: "예외를 던지지 않고도 현재 트랜잭션을 롤백하도록 표시하는 방법이다.",
          why: "예외를 던져 흐름을 끊지 않고 정상 응답을 돌려주면서도 변경 내용은 롤백해야 하는 경우를 처리하기 위해서다.",
          how: [
            "예외를 catch해서 정상 응답을 돌려주되 데이터 변경은 취소하고 싶을 때 쓴다.",
            "- `TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()`를 호출하면 메서드가 정상 종료해도 커밋 대신 롤백된다.",
            "- 코드가 스프링 트랜잭션 API에 직접 묶이므로, 가능하면 예외를 다시 던지는 방식이 더 명확하다."
          ],
          use: ["검증 실패를 사용자에게 오류 메시지로 돌려주면서 그때까지의 변경은 모두 취소한다."],
          answer: "setRollbackOnly는 예외를 던지지 않고도 현재 트랜잭션을 롤백하도록 표시하는 방법입니다. 예외를 catch해 정상 응답을 돌려주되 데이터 변경은 취소하고 싶을 때 쓰지만, 코드가 스프링 트랜잭션 API에 묶이므로 가능하면 예외를 다시 던지는 편이 명확합니다.",
          followUps: [
            [
              "REQUIRED로 참여한 내부 메서드가 setRollbackOnly를 호출하면?",
              "물리 트랜잭션 전체에 롤백 표시가 남아, 외부가 정상 종료해도 커밋 시점에 롤백되고 UnexpectedRollbackException이 발생합니다."
            ]
          ],
          related: ["spring/rolbaek-gyuchik", "spring/unexpectedrollback-yeoe"]
        }
      ]
    },
    {
      name: "적용 안 되는 경우",
      compare: {
        cols: ["개념", "원인", "증상", "해결"],
        rows: [
          ["private 메서드", "프록시가 가로챌 수 없음", "트랜잭션 없이 실행", "public 메서드로 분리"],
          ["new로 만든 객체", "빈이 아니라 프록시 없음", "애너테이션 무시", "빈으로 등록해 주입"],
          ["@PostConstruct 안의 트랜잭션", "초기화 중엔 프록시 미경유", "트랜잭션 없이 실행", "`ApplicationReadyEvent`에서 호출"],
          ["다른 스레드에서의 트랜잭션", "ThreadLocal 기반 동기화", "호출자 트랜잭션에 미참여", "별도 트랜잭션으로 설계"],
          ["UnexpectedRollback 예외", "내부가 rollback-only 표시", "외부 커밋 시 예외", "`REQUIRES_NEW` 또는 예외 전파"]
        ]
      },
      concepts: [
        {
          id: "spring/private-meseodeu",
          slug: "private-meseodeu",
          title: "private 메서드",
          deep: false,
          def: "`@Transactional`을 private 메서드에 붙이면 트랜잭션이 적용되지 않는다.",
          why: "프록시가 private 메서드를 가로챌 수 없어 트랜잭션이 조용히 빠지는 함정을 알고 피하기 위해서다.",
          how: [
            "CGLIB 프록시는 대상 클래스를 상속해 메서드를 오버라이드하는 방식인데, private 메서드는 오버라이드할 수 없다.",
            "- 스프링 6.0 이전에는 public 메서드에만 적용되었다.",
            "- 스프링 6.0부터 CGLIB 프록시에서는 protected와 package-private 메서드에도 적용되지만 private은 여전히 안 된다.",
            "- final 메서드도 오버라이드할 수 없어 마찬가지다."
          ],
          use: ["코드 리뷰에서 private 메서드에 붙은 @Transactional을 찾아 public 메서드나 별도 빈으로 옮긴다."],
          myth: [
            [
              "private 메서드에 붙여도 컴파일 오류가 없으니 동작한다.",
              "컴파일도 실행도 정상이라 더 위험합니다. 트랜잭션 없이 조용히 실행되므로 롤백이 기대대로 되지 않습니다."
            ]
          ],
          answer: "private 메서드에 @Transactional을 붙이면 적용되지 않습니다. CGLIB 프록시는 클래스를 상속해 메서드를 오버라이드하는 방식인데 private 메서드는 오버라이드할 수 없기 때문입니다. 스프링 6부터 protected와 package-private은 적용되지만 private과 final은 여전히 안 됩니다.",
          followUps: [
            [
              "스프링 6에서 무엇이 바뀌었나요?",
              "스프링 6.0부터 CGLIB 기반 클래스 프록시에서는 protected와 package-private 메서드에도 @Transactional이 적용됩니다. 인터페이스 기반 JDK 프록시는 여전히 public 메서드만 대상입니다."
            ]
          ],
          related: ["spring/transactional-dongjak-wonri"]
        },
        {
          id: "spring/newro-mandeun-gaekche",
          slug: "newro-mandeun-gaekche",
          title: "new로 만든 객체",
          deep: false,
          def: "`new`로 직접 생성한 객체는 스프링 빈이 아니므로 `@Transactional`이 붙어 있어도 프록시가 없어 적용되지 않는다.",
          why: "스프링 빈이 아닌 객체에는 프록시가 없어 `@Transactional`이 무시된다는 점을 알고 피하기 위해서다.",
          how: [
            "트랜잭션은 컨테이너가 빈을 등록할 때 프록시로 바꿔 주는 방식이라, 컨테이너를 거치지 않은 객체에는 아무 효과가 없다.",
            "- 반드시 의존성 주입으로 받은 빈을 통해 호출한다.",
            "- 흔한 실수: 유틸 클래스나 서비스를 `new`로 만들어 쓰거나, 스레드·람다 안에서 `new SomeService()`로 생성해 호출한다.",
            "- `@Transactional`뿐 아니라 `@Async`, `@Cacheable`, `@Retryable`처럼 프록시로 동작하는 기능은 모두 같은 이유로 적용되지 않는다.",
            "- 직접 만든 객체에서 꼭 트랜잭션이 필요하면 `TransactionTemplate`으로 코드에서 트랜잭션을 연다."
          ],
          use: ["테스트나 유틸 코드에서 `new OrderService(...)`로 만든 객체를 호출하며 트랜잭션을 기대하는 실수를 찾는다."],
          answer: "new로 직접 만든 객체는 스프링 빈이 아니라 프록시가 없으므로 @Transactional이 붙어 있어도 적용되지 않습니다. 트랜잭션은 컨테이너가 빈을 등록할 때 프록시로 바꿔 주는 방식이라 반드시 주입받은 빈을 통해 호출해야 합니다.",
          analogy: "경비원이 서 있는 정문이 아니라 담을 넘어 들어가는 것과 같습니다. 출입 기록이 남지 않습니다.",
          followUps: [["빈이 아닌 객체에서 트랜잭션이 필요하면?", "TransactionTemplate을 주입받아 코드로 트랜잭션 경계를 직접 정하거나, 그 로직을 스프링 빈으로 옮깁니다."]],
          related: ["spring/transactional-dongjak-wonri"]
        },
        {
          id: "spring/postconstruct-anui-teuraenjaeksyeon",
          slug: "postconstruct-anui-teuraenjaeksyeon",
          title: "@PostConstruct 안의 트랜잭션",
          deep: false,
          def: "`@PostConstruct` 메서드에서 `@Transactional` 메서드를 호출하거나 직접 붙여도 트랜잭션이 적용되지 않을 수 있다.",
          why: "초기화 시점에는 프록시가 적용되기 전이라 트랜잭션이 걸리지 않는 문제를 알고, `ApplicationReadyEvent` 같은 대안을 쓰기 위해서다.",
          how: [
            "`@PostConstruct`는 빈 초기화 단계에서 원본 객체에 대해 호출된다. AOP 프록시는 초기화가 끝난 뒤 BeanPostProcessor가 만들기 때문에, 이 시점의 호출은 프록시를 거치지 않는다.",
            "- 초기 데이터 적재처럼 기동 시 트랜잭션이 필요하면 `ApplicationReadyEvent`를 받는 `@EventListener`에서 실행한다. 이 시점에는 모든 빈과 프록시가 준비되어 있다.",
            "- 같은 빈 안의 다른 `@Transactional` 메서드를 호출하는 것은 셀프 호출이라 마찬가지로 프록시를 거치지 않는다.",
            "- 주입받은 다른 빈의 `@Transactional` 메서드는 보통 프록시를 통해 호출되지만, 스프링은 초기화 시점에 트랜잭션 인프라가 모두 준비되었다고 보장하지 않으므로 기대지 않는다.",
            "- `TransactionTemplate`을 주입받아 `@PostConstruct` 안에서 직접 트랜잭션을 여는 방법도 있다."
          ],
          flow: ["빈 생성과 의존 주입", "@PostConstruct 호출(원본)", "후처리기가 프록시 생성", "모든 빈 준비 완료", "ApplicationReadyEvent 발행"],
          use: ["기동 시 초기 데이터를 넣는 코드를 @PostConstruct에서 ApplicationReadyEvent 리스너로 옮긴다."],
          answer: "@PostConstruct는 프록시가 만들어지기 전 원본 객체에서 호출되므로 그 안에서는 @Transactional이 동작하지 않을 수 있습니다. AOP 프록시는 초기화가 끝난 뒤 BeanPostProcessor가 만들기 때문입니다. 기동 시 트랜잭션이 필요하면 ApplicationReadyEvent 리스너에서 실행합니다.",
          followUps: [
            [
              "@PostConstruct에서 자기 자신의 @Transactional 메서드를 부르면?",
              "원본 객체의 this 호출이라 프록시를 거치지 않고, 아직 프록시도 없습니다. 트랜잭션 없이 실행됩니다."
            ]
          ],
          related: ["spring/transactional-dongjak-wonri"]
        },
        {
          id: "spring/dareun-seuredeueseoui-teuraenjaeksyeon",
          slug: "dareun-seuredeueseoui-teuraenjaeksyeon",
          title: "다른 스레드에서의 트랜잭션",
          deep: false,
          def: "트랜잭션은 스레드에 묶여 있어, `@Async`나 새로 만든 스레드에서 실행된 작업은 호출한 쪽의 트랜잭션에 참여하지 않는다.",
          why: "트랜잭션이 스레드에 묶여 있어 비동기 작업은 롤백 범위에서 빠진다는 점을 알고 데이터 불일치를 막기 위해서다.",
          how: [
            "트랜잭션 동기화가 ThreadLocal로 커넥션을 보관하기 때문에, 다른 스레드에서는 그 커넥션을 볼 수 없다.",
            "- 비동기 작업에 트랜잭션이 필요하면 그 메서드에 따로 `@Transactional`을 붙여 독립된 트랜잭션으로 실행한다.",
            "- 외부 트랜잭션이 아직 커밋되기 전에 비동기 작업이 데이터를 읽으면 최신 데이터가 보이지 않는다. 커밋 후 실행하려면 `@TransactionalEventListener(phase = AFTER_COMMIT)`을 쓴다."
          ],
          use: ["주문 커밋 후 비동기로 메일을 보낼 때 @TransactionalEventListener와 @Async를 함께 써 커밋된 데이터만 보게 한다."],
          myth: [
            [
              "@Async 메서드도 호출한 쪽의 트랜잭션 안에서 실행된다.",
              "다른 스레드라 커넥션을 공유하지 않습니다. 호출한 쪽이 롤백해도 비동기 작업의 결과는 되돌려지지 않습니다."
            ]
          ],
          answer: "트랜잭션은 ThreadLocal로 스레드에 묶여 있어 @Async나 새로 만든 스레드의 작업은 호출한 쪽 트랜잭션에 참여하지 않습니다. 비동기 작업은 자기 트랜잭션을 따로 열어야 하고, 외부 커밋 이후에 실행되어야 한다면 커밋 이후 이벤트 리스너를 씁니다.",
          analogy: "다른 부서에 일을 넘기면 내 결재 라인과 상관없이 그 부서의 결재 라인을 따로 타는 것과 같습니다.",
          followUps: [
            [
              "비동기 작업이 방금 저장한 데이터를 못 찾는 이유는?",
              "외부 트랜잭션이 아직 커밋되기 전에 비동기 작업이 다른 커넥션으로 조회했기 때문입니다. 커밋 이후 실행되도록 AFTER_COMMIT 이벤트로 넘깁니다."
            ]
          ],
          related: ["spring/teuraenjaeksyeon-donggihwa", "spring/teuraenjaeksyeon-ibenteu-riseuneo"]
        },
        {
          id: "spring/unexpectedrollback-yeoe",
          slug: "unexpectedrollback-yeoe",
          title: "UnexpectedRollback 예외",
          deep: false,
          def: "참여한 내부 트랜잭션이 롤백 표시를 남겼는데 외부가 커밋을 시도할 때 발생하는 예외다.",
          why: "내부 트랜잭션의 예외를 잡아 삼켜도 전체가 롤백되는 이유를 알아야 이 예외를 이해하고 REQUIRES_NEW 같은 대안을 고를 수 있기 때문이다.",
          how: [
            "1) 외부 REQUIRED 트랜잭션 안에서 내부 REQUIRED 메서드가 런타임 예외를 던진다.",
            "2) 내부는 신규 트랜잭션이 아니므로 실제 롤백 대신 물리 트랜잭션에 rollback-only 표시를 남긴다.",
            "3) 외부가 그 예외를 catch하고 정상적으로 끝나 커밋을 시도한다.",
            "4) 트랜잭션 매니저가 rollback-only 표시를 확인하고 롤백한 뒤, 커밋을 기대한 호출자에게 이 예외를 던진다.",
            "내부 실패를 외부와 분리하려면 내부를 REQUIRES_NEW로 바꾸거나, 내부를 호출하기 전에 실패 조건을 검사한다."
          ],
          flow: [
            "내부 REQUIRED에서 예외",
            "rollback-only 표시",
            "외부가 예외를 catch",
            "외부가 커밋 시도",
            "표시 확인 후 롤백",
            "UnexpectedRollback 발생"
          ],
          use: ["로그 저장 실패를 catch했는데 주문까지 롤백되는 현상의 원인을 찾을 때 쓴다."],
          answer: "UnexpectedRollbackException은 REQUIRED로 참여한 내부 트랜잭션이 rollback-only 표시를 남겼는데 외부가 커밋을 시도할 때 발생합니다. 외부가 내부 예외를 catch해도 물리 트랜잭션은 하나라 전체가 롤백되고, 커밋을 기대한 호출자에게 이 예외로 알려 줍니다.",
          followUps: [
            [
              "이 예외를 피하려면 어떻게 하나요?",
              "실패를 분리해야 하는 내부 로직은 REQUIRES_NEW로 독립 트랜잭션을 쓰거나, 예외가 나기 전에 조건을 검사해 예외 자체를 피합니다."
            ]
          ],
          related: ["spring/required", "spring/requires-new", "spring/mulri-nonri-teuraenjaeksyeon"]
        }
      ]
    },
    {
      name: "읽기 전용",
      compare: {
        cols: ["기준", "readOnly", "읽기 · 쓰기 DB 라우팅"],
        rows: [
          ["목적", "읽기 성능 최적화", "DB 부하 분산"],
          ["적용 범위", "트랜잭션 하나", "DataSource 선택"],
          ["핵심 동작", "JPA 플러시·스냅샷 생략", "Replica로 커넥션 라우팅"],
          ["구현", "`readOnly = true` 속성", "`AbstractRoutingDataSource`"],
          ["주의점", "쓰기 차단 여부는 DB마다 다름", "복제 지연, 커넥션 획득 지연 필요"]
        ]
      },
      concepts: [
        {
          id: "spring/readonly",
          slug: "readonly",
          title: "readOnly",
          deep: false,
          def: "`@Transactional(readOnly = true)`는 이 트랜잭션이 데이터를 바꾸지 않는다는 힌트로, 여러 계층에서 최적화가 일어난다.",
          why: "조회 전용 트랜잭션에서 변경 감지와 플러시 같은 불필요한 작업을 줄이고, 의도치 않은 쓰기를 막기 위해서다.",
          how: [
            "- 하이버네이트: 플러시 모드를 MANUAL로 바꿔 커밋 시 플러시하지 않고, 변경 감지용 스냅샷을 만들지 않아 메모리와 CPU를 아낀다.",
            "- JDBC 드라이버와 DB: `Connection.setReadOnly(true)`로 읽기 전용 트랜잭션 최적화를 할 수 있다.",
            "- 클래스에 `readOnly = true`를 두고 쓰기 메서드에만 `@Transactional`을 다시 붙이는 패턴이 흔하다."
          ],
          use: [
            "조회 전용 서비스 클래스 전체에 `@Transactional(readOnly = true)`를 붙인다.",
            "대량 조회 API에서 스냅샷 생성을 막아 메모리 사용량을 줄인다."
          ],
          warn: ["읽기 전용 트랜잭션에서 엔티티 값을 바꿔도 플러시되지 않아 DB에 반영되지 않는다. 쓰기 메서드에 실수로 붙지 않게 주의한다."],
          myth: [
            [
              "readOnly 트랜잭션에서는 엔티티를 수정하면 예외가 난다.",
              "예외 없이 조용히 무시됩니다. 플러시가 일어나지 않아 DB에 반영되지 않을 뿐이라 실수로 붙이면 찾기 어렵습니다."
            ]
          ],
          answer: "readOnly = true는 데이터를 바꾸지 않는다는 힌트로, 하이버네이트는 플러시를 생략하고 변경 감지용 스냅샷을 만들지 않아 메모리와 CPU를 아낍니다. DB 드라이버의 읽기 전용 최적화와 레플리카 라우팅에도 쓰입니다. 클래스에 readOnly를 두고 쓰기 메서드에만 일반 트랜잭션을 붙이는 패턴이 흔합니다.",
          followUps: [
            [
              "조회에도 트랜잭션을 거는 이유는?",
              "지연 로딩과 영속성 컨텍스트를 쓰려면 트랜잭션이 필요하고, readOnly로 플러시와 스냅샷 비용을 줄이며, 여러 조회 사이의 일관성과 레플리카 라우팅도 얻을 수 있기 때문입니다."
            ]
          ],
          related: ["spring/ikgi-sseugi-db-rauting", "spring/byeongyeong-gamji"]
        },
        {
          id: "spring/ikgi-sseugi-db-rauting",
          slug: "ikgi-sseugi-db-rauting",
          title: "읽기 · 쓰기 DB 라우팅",
          deep: false,
          def: "readOnly 여부를 보고 쓰기는 Primary DB, 읽기는 Replica DB로 보내 DB 부하를 나누는 방법이다.",
          why: "읽기 요청이 대부분인 서비스에서 Primary DB 하나에 몰리는 부하를 Replica로 분산하기 위해서다.",
          how: [
            "`AbstractRoutingDataSource`를 상속해 `TransactionSynchronizationManager.isCurrentTransactionReadOnly()`로 대상을 고른다.",
            "- 트랜잭션이 시작된 뒤에 커넥션을 얻어야 readOnly 여부가 반영되므로 `LazyConnectionDataSourceProxy`로 감싼다.",
            "- 레플리카는 복제 지연이 있어, 방금 쓴 데이터를 바로 읽어야 하는 흐름은 Primary에서 읽게 한다."
          ],
          flow: ["readOnly 여부 결정", "Lazy 프록시가 커넥션 지연", "첫 쿼리 때 readOnly 확인", "Primary 또는 Replica 선택"],
          use: ["조회 트래픽이 대부분인 서비스에서 레플리카를 늘려 Primary DB 부하를 줄인다."],
          answer: "읽기·쓰기 DB 라우팅은 트랜잭션의 readOnly 여부를 보고 쓰기는 Primary DB, 읽기는 Replica DB로 보내 부하를 나누는 방법입니다. AbstractRoutingDataSource로 대상을 고르고, 트랜잭션 시작 후에 커넥션을 얻도록 LazyConnectionDataSourceProxy로 감쌉니다.",
          analogy: "주문은 본점 카운터에서 받고, 메뉴 문의는 여러 안내 데스크에서 나눠 답하는 것과 같습니다.",
          followUps: [
            [
              "LazyConnectionDataSourceProxy가 필요한 이유는?",
              "트랜잭션 매니저는 트랜잭션을 시작할 때 커넥션을 먼저 얻는데, 그 시점에는 readOnly 정보가 동기화되기 전이라 항상 기본 DB가 선택될 수 있습니다. 실제 쿼리 시점까지 커넥션 획득을 미뤄 올바른 DB를 고르게 합니다."
            ],
            [
              "복제 지연은 어떻게 다루나요?",
              "방금 쓴 데이터를 바로 읽어야 하는 흐름은 같은 쓰기 트랜잭션 안에서 Primary로 읽게 하고, 약간 늦어도 되는 조회만 레플리카로 보냅니다."
            ]
          ],
          related: ["spring/readonly"]
        }
      ]
    },
    {
      name: "커밋 이후 처리",
      concepts: [
        {
          id: "spring/teuraenjaeksyeon-ibenteu-riseuneo",
          slug: "teuraenjaeksyeon-ibenteu-riseuneo",
          title: "트랜잭션 이벤트 리스너",
          deep: false,
          def: "트랜잭션의 특정 단계(기본은 커밋 직후)에 맞춰 이벤트를 처리하는 리스너다.",
          why: "메일 발송 같은 후속 작업이 롤백된 데이터를 기준으로 실행되는 것을 막고, 커밋이 확정된 뒤에만 처리하기 위해서다.",
          how: [
            "`ApplicationEventPublisher`로 발행한 이벤트를 `@TransactionalEventListener`가 받으면, 트랜잭션이 커밋된 뒤(AFTER_COMMIT)에 실행된다.",
            "- 가입 축하 메일, 메시지 발행처럼 DB 커밋이 확정된 뒤에만 해야 하는 일에 쓴다. 롤백되면 실행되지 않는다.",
            "- phase로 BEFORE_COMMIT, AFTER_ROLLBACK, AFTER_COMPLETION도 지정할 수 있다."
          ],
          flow: ["트랜잭션 안에서 이벤트 발행", "리스너 실행을 보류", "트랜잭션 커밋", "AFTER_COMMIT 리스너 실행"],
          use: ["회원 가입이 커밋된 뒤에만 가입 축하 메일을 보낸다.", "주문 커밋 후 Kafka로 주문 완료 이벤트를 발행한다."],
          warn: ["AFTER_COMMIT 시점에는 원래 트랜잭션이 이미 끝나서, 리스너에서 DB를 바꾸려면 REQUIRES_NEW 트랜잭션이 필요하다."],
          myth: [
            [
              "일반 @EventListener도 커밋 후에 실행된다.",
              "@EventListener는 publishEvent를 호출한 즉시 같은 트랜잭션 안에서 실행됩니다. 커밋 이후 실행을 보장하려면 @TransactionalEventListener를 써야 합니다."
            ]
          ],
          answer: "@TransactionalEventListener는 트랜잭션의 특정 단계, 기본은 커밋 직후에 이벤트를 처리하는 리스너입니다. 메일 발송이나 메시지 발행처럼 커밋이 확정된 뒤에만 해야 하는 일에 쓰며, 롤백되면 실행되지 않습니다. 커밋 이후에는 원래 트랜잭션이 끝나 DB 작업에는 REQUIRES_NEW가 필요합니다.",
          analogy: "택배를 결제가 완료된 뒤에만 발송하는 것과 같습니다. 결제가 취소되면 발송 자체가 일어나지 않습니다.",
          followUps: [
            [
              "트랜잭션 없이 이벤트를 발행하면 어떻게 되나요?",
              "기본 설정에서는 리스너가 실행되지 않습니다. 트랜잭션이 없어도 실행하려면 fallbackExecution = true를 지정합니다."
            ]
          ],
          related: ["spring/requires-new", "spring/dareun-seuredeueseoui-teuraenjaeksyeon"]
        }
      ]
    }
  ]
};

export default topic;
