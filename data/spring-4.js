(window.MINDMAP = window.MINDMAP || {})['spring-4'] = {
  name: '트랜잭션',
  groups: [
    { name: '동작 원리', items: [
      { t: '@Transactional 동작 원리', deep: true,
        d: '`@Transactional`이 붙은 빈을 AOP 프록시로 감싸, 메서드 시작 시 트랜잭션을 열고 끝나면 커밋하거나 롤백하는 선언적 트랜잭션 방식이다.',
        why: '서비스 코드마다 커넥션 획득, `setAutoCommit(false)`, commit, rollback, close를 직접 쓰면 비즈니스 로직이 트랜잭션 코드에 묻힌다. 애너테이션 하나로 트랜잭션 경계를 선언하고 실제 처리는 프록시에 맡긴다.',
        how: [
          '컨테이너가 빈을 만들 때 `@Transactional`이 붙은 클래스를 발견하면 원본 대신 CGLIB 프록시를 빈으로 등록한다. 외부에서 메서드를 부르면 프록시의 TransactionInterceptor가 먼저 실행된다.',
          '1) 트랜잭션 매니저가 DataSource에서 커넥션을 얻고 `setAutoCommit(false)`로 트랜잭션을 시작한다.',
          '2) 그 커넥션을 TransactionSynchronizationManager(ThreadLocal)에 보관한다.',
          '3) 원본 메서드를 실행한다. 그 안의 Repository, JdbcTemplate, EntityManager는 같은 스레드의 보관소에서 같은 커넥션을 꺼내 쓴다.',
          '4) 정상 종료면 커밋, 롤백 대상 예외가 나면 롤백한다.',
          '5) 커넥션을 풀에 반납하고 보관소를 비운다.',
          '애너테이션은 메서드 > 클래스 > 인터페이스 순서로 우선 적용된다. 보통 서비스 계층에 둔다.'
        ],
        code: `@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final StockRepository stockRepository;

    @Transactional
    public Long order(Long itemId, int qty) {
        Stock stock = stockRepository.findByItemId(itemId).orElseThrow();
        stock.decrease(qty);              // 변경 감지로 UPDATE
        Order order = orderRepository.save(Order.create(itemId, qty));
        return order.getId();             // 정상 종료 시 커밋
    }
}`,
        warn: [
          '프록시를 거치지 않는 내부 호출(셀프 호출)에는 적용되지 않는다.',
          'private 메서드와 `new`로 만든 객체에는 적용되지 않는다.',
          '트랜잭션 안에서 외부 API를 부르면 응답을 기다리는 동안 커넥션을 붙잡는다. 트랜잭션은 짧게 유지한다.'
        ],
        qa: ['@Transactional은 내부적으로 어떻게 동작하나요?',
          'AOP 프록시가 메서드 호출을 가로채 트랜잭션 매니저로 커넥션을 얻고 자동 커밋을 끈 뒤, 그 커넥션을 ThreadLocal 기반 동기화 매니저에 보관합니다. 같은 스레드의 데이터 접근 코드는 이 커넥션을 공유하고, 메서드가 정상 종료되면 커밋, 런타임 예외가 나면 롤백합니다. 프록시 방식이라 셀프 호출이나 private 메서드에는 적용되지 않습니다.'],
        rel: ['트랜잭션 매니저', '트랜잭션 동기화', 'REQUIRED', '롤백 규칙'] },
      { t: '트랜잭션 매니저', deep: false,
        d: '트랜잭션 시작, 커밋, 롤백을 기술과 상관없이 같은 방식으로 다루게 해 주는 스프링의 트랜잭션 추상화 인터페이스다.',
        how: [
          'JDBC는 `Connection.commit()`, JPA는 `EntityTransaction.commit()`처럼 기술마다 트랜잭션 API가 다르다. 스프링은 `getTransaction()`, `commit()`, `rollback()` 세 메서드로 이를 통일했다.',
          '- DataSourceTransactionManager: JDBC, MyBatis용',
          '- JpaTransactionManager: JPA용. JDBC 작업도 같은 트랜잭션으로 묶어 준다.',
          '- 스프링 부트는 사용하는 기술을 보고 알맞은 구현체를 자동으로 등록한다.',
          '덕분에 데이터 접근 기술을 JDBC에서 JPA로 바꿔도 서비스의 `@Transactional` 코드는 그대로다.'
        ],
        rel: ['@Transactional 동작 원리', '트랜잭션 동기화'] },
      { t: '트랜잭션 동기화', deep: false,
        d: '한 트랜잭션 안의 모든 데이터 접근 코드가 같은 커넥션을 쓰도록, 커넥션을 스레드별 저장소에 보관해 공유하는 메커니즘이다.',
        how: [
          '트랜잭션은 커넥션 단위로 동작하므로, 서비스가 여러 Repository를 호출해도 모두 같은 커넥션을 써야 하나의 트랜잭션이 된다.',
          '예전에는 커넥션을 파라미터로 계속 넘겨야 했지만, 스프링은 TransactionSynchronizationManager가 ThreadLocal에 커넥션을 보관하고 `DataSourceUtils.getConnection()`이나 EntityManager가 여기서 꺼내 쓴다.',
          '- ThreadLocal 기반이라 같은 스레드 안에서만 공유된다.',
          '- 트랜잭션이 끝나면 보관소를 비워 스레드 재사용 시 섞이지 않게 한다.'
        ],
        warn: ['`@Async`나 직접 만든 스레드로 넘어간 작업은 트랜잭션을 공유하지 않는다.'],
        rel: ['@Transactional 동작 원리', '다른 스레드에서의 트랜잭션'] },
      { t: '물리 · 논리 트랜잭션', deep: false,
        d: '실제 DB 커넥션 단위의 트랜잭션이 물리 트랜잭션이고, 그 안에 참여한 각 `@Transactional` 메서드 단위가 논리 트랜잭션이다.',
        how: [
          '외부 서비스와 내부 서비스가 모두 REQUIRED로 묶이면 물리 트랜잭션은 1개, 논리 트랜잭션은 2개다.',
          '- 원칙: 모든 논리 트랜잭션이 커밋되어야 물리 트랜잭션이 커밋된다.',
          '- 하나라도 롤백되면 물리 트랜잭션 전체가 롤백된다.',
          '- 실제 커밋과 롤백은 처음 트랜잭션을 시작한 신규 트랜잭션만 수행한다. 참여한 내부 트랜잭션의 커밋은 아무 일도 하지 않는다.',
          '이 구분을 알아야 전파 속성과 UnexpectedRollbackException을 이해할 수 있다.'
        ],
        rel: ['REQUIRED', 'UnexpectedRollback 예외'] }
    ]},
    { name: '전파 속성', items: [
      { t: 'REQUIRED', deep: true,
        d: '기본 전파 속성으로, 진행 중인 트랜잭션이 있으면 그 트랜잭션에 참여하고 없으면 새로 시작한다.',
        why: '주문 저장과 재고 차감처럼 여러 서비스 메서드가 하나의 작업 단위로 함께 성공하거나 함께 실패해야 할 때, 별도 설정 없이 자연스럽게 하나의 트랜잭션으로 묶어 준다.',
        how: [
          '1) 외부 메서드 호출: 진행 중인 트랜잭션이 없으므로 새 물리 트랜잭션을 시작한다(신규 트랜잭션).',
          '2) 내부 메서드 호출: 이미 트랜잭션이 있으므로 같은 커넥션을 쓰며 참여한다.',
          '3) 내부 정상 종료: 참여한 트랜잭션은 실제 커밋을 하지 않는다.',
          '4) 내부에서 예외: 실제 롤백 대신 트랜잭션에 rollback-only 표시를 남긴다.',
          '5) 외부 종료: 신규 트랜잭션인 외부가 최종 커밋한다. rollback-only 표시가 있으면 커밋 대신 롤백하고 예외를 던진다.',
          '즉 참여한 모든 메서드가 성공해야 커밋되는 "운명 공동체"가 된다.'
        ],
        code: `@Transactional   // propagation 기본값 REQUIRED
public void placeOrder(OrderRequest req) {
    orderService.save(req);      // 같은 트랜잭션에 참여
    stockService.decrease(req);  // 예외 시 주문 저장까지 함께 롤백
}

@Service
class StockService {
    @Transactional(propagation = Propagation.REQUIRED)
    public void decrease(OrderRequest req) { ... }
}`,
        warn: [
          '내부에서 난 예외를 외부가 catch해도 rollback-only 표시 때문에 전체가 롤백되고 UnexpectedRollbackException이 난다.',
          '같은 클래스 안의 호출은 전파 속성과 상관없이 프록시를 거치지 않는다.'
        ],
        qa: ['REQUIRED와 REQUIRES_NEW의 차이는?',
          'REQUIRED는 기존 트랜잭션이 있으면 참여해 하나의 물리 트랜잭션으로 묶이므로, 내부가 실패하면 외부까지 모두 롤백됩니다. REQUIRES_NEW는 기존 트랜잭션을 보류하고 새 커넥션으로 독립된 트랜잭션을 열어, 내부가 롤백돼도 외부는 커밋될 수 있습니다. 실패 이력처럼 반드시 남겨야 하는 작업에 REQUIRES_NEW를 씁니다.'],
        rel: ['REQUIRES_NEW', '물리 · 논리 트랜잭션', 'UnexpectedRollback 예외'] },
      { t: 'REQUIRES_NEW', deep: true,
        d: '항상 새 트랜잭션을 시작하고, 진행 중이던 트랜잭션은 끝날 때까지 잠시 보류한다.',
        why: '주문 처리가 실패해 롤백되더라도 "실패 이력"이나 감사 로그는 반드시 남겨야 할 때처럼, 바깥 트랜잭션의 결과와 독립적으로 커밋해야 하는 작업에 쓴다.',
        how: [
          '1) 외부 트랜잭션이 진행 중일 때 REQUIRES_NEW 메서드가 호출된다.',
          '2) 외부 트랜잭션의 커넥션과 동기화 정보를 보관소에서 떼어 내 잠시 보류(suspend)한다.',
          '3) 커넥션 풀에서 새 커넥션을 얻어 새 물리 트랜잭션을 시작한다.',
          '4) 내부 메서드가 끝나면 이 트랜잭션만 독립적으로 커밋하거나 롤백한다.',
          '5) 보류했던 외부 트랜잭션을 복원(resume)해 이어서 진행한다.'
        ],
        code: `@Service
@RequiredArgsConstructor
public class OrderFacade {
    private final OrderService orderService;
    private final FailLogService failLogService;

    @Transactional
    public void order(OrderRequest req) {
        try {
            orderService.place(req);
        } catch (PaymentException e) {
            failLogService.save(req.orderId(), e.getMessage());  // 별도 커밋
            throw e;
        }
    }
}

@Service
class FailLogService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void save(Long orderId, String reason) { ... }
}`,
        warn: [
          '같은 클래스 안에서 호출하면 프록시를 거치지 않아 새 트랜잭션이 열리지 않는다. 별도 빈으로 분리한다.',
          '한 요청이 커넥션 2개를 동시에 쓴다. 동시 요청이 많으면 커넥션 풀이 고갈되어 서로 기다리는 교착 상태가 생길 수 있다.',
          '내부에서 던진 예외를 외부가 잡지 않으면 외부 트랜잭션도 롤백된다.'
        ],
        qa: ['REQUIRES_NEW는 언제 쓰고 무엇을 주의해야 하나요?',
          '외부 트랜잭션이 롤백되더라도 반드시 커밋되어야 하는 로그나 이력 저장에 씁니다. 기존 트랜잭션을 보류하고 새 커넥션으로 독립된 트랜잭션을 열기 때문에 결과가 서로 영향을 주지 않습니다. 다만 커넥션을 동시에 두 개 쓰므로 풀 고갈에 주의해야 하고, 셀프 호출에서는 적용되지 않습니다.'],
        rel: ['REQUIRED', 'NESTED', '물리 · 논리 트랜잭션'] },
      { t: 'NESTED', deep: false,
        d: '진행 중인 트랜잭션 안에 세이브포인트를 만들어, 내부 작업만 세이브포인트까지 부분 롤백할 수 있게 한다.',
        how: [
          '- 외부 트랜잭션이 없으면 REQUIRED처럼 새로 시작한다.',
          '- 내부가 롤백되면 세이브포인트 이후 변경만 취소되고 외부는 계속 진행할 수 있다.',
          '- 외부가 롤백되면 내부 변경도 함께 롤백된다. 이 점이 REQUIRES_NEW와 다르다.',
          '- 같은 커넥션을 쓰므로 커넥션을 추가로 쓰지 않는다.'
        ],
        warn: ['JDBC 세이브포인트를 쓰므로 DataSourceTransactionManager에서만 동작한다. JPA(JpaTransactionManager)에서는 지원되지 않는다.'],
        rel: ['REQUIRES_NEW', 'REQUIRED'] },
      { t: 'SUPPORTS', deep: false,
        d: '진행 중인 트랜잭션이 있으면 참여하고, 없으면 트랜잭션 없이 실행한다.',
        how: [
          '트랜잭션이 꼭 필요하지는 않지만, 호출한 쪽에 트랜잭션이 있다면 같은 커넥션과 영속성 컨텍스트를 공유하는 편이 좋은 조회 로직에 쓴다.',
          '- 트랜잭션 없이 실행되면 각 쿼리가 자동 커밋으로 실행된다.',
          '- 쓰임 예: 단독으로 호출되면 트랜잭션 없이 가볍게 조회하고, 주문 트랜잭션 안에서 호출되면 같은 영속성 컨텍스트에서 방금 저장한 데이터를 보게 할 때 쓴다.',
          '- 트랜잭션 없이 실행되더라도 스프링은 기본으로 트랜잭션 동기화를 켜 두어, 메서드 안에서는 같은 커넥션과 EntityManager를 공유한다.',
          '- 주의: 트랜잭션 없이 실행될 때 변경 감지로 수정한 값은 커밋 시점이 없어 DB에 반영되지 않는다.'
        ],
        rel: ['REQUIRED', 'NOT_SUPPORTED'] },
      { t: 'MANDATORY', deep: false,
        d: '반드시 진행 중인 트랜잭션 안에서만 호출되어야 하며, 없으면 `IllegalTransactionStateException`을 던진다.',
        how: [
          '혼자 실행되면 데이터 정합성이 깨지는 메서드를 보호할 때 쓴다. 예를 들어 반드시 주문 트랜잭션의 일부로만 실행되어야 하는 재고 차감 메서드에 붙여, 실수로 단독 호출하는 것을 막는다.',
          '- 동작: 진행 중인 트랜잭션이 있으면 REQUIRED처럼 참여하고, 없으면 메서드를 실행하지 않고 바로 예외를 던진다.',
          '- 장점: "이 메서드는 상위 트랜잭션의 일부"라는 설계 의도를 코드로 드러내고, 실수를 운영이 아니라 테스트에서 바로 발견하게 한다.',
          '- 참여한 상태에서 런타임 예외가 나면 바깥 트랜잭션 전체가 rollback-only로 표시된다.'
        ],
        rel: ['REQUIRED', 'NEVER'] },
      { t: 'NOT_SUPPORTED', deep: false,
        d: '진행 중인 트랜잭션을 보류하고, 트랜잭션 없이 실행한다.',
        how: [
          '트랜잭션 안에서 실행할 필요가 없고 오래 걸리는 작업(대용량 조회, 외부 시스템 호출)이 외부 트랜잭션의 락이나 커넥션을 오래 붙잡지 않게 할 때 쓴다.',
          '- 메서드가 끝나면 보류했던 트랜잭션을 다시 이어 간다.',
          '- 쓰임 예: 주문 트랜잭션 안에서 리포트용 대용량 조회를 해야 할 때, 그 조회가 트랜잭션의 락이나 스냅샷에 묶이지 않게 분리한다.',
          '- 주의: 보류된 바깥 트랜잭션도 커넥션을 계속 쥐고 있어, 안쪽에서 쿼리를 실행하면 커넥션을 하나 더 쓴다. 동시 요청이 많으면 커넥션 풀 고갈에 주의한다.',
          '- 안쪽에서 예외를 잡아 처리하면 보류된 바깥 트랜잭션은 영향을 받지 않는다.'
        ],
        rel: ['SUPPORTS', 'REQUIRES_NEW'] },
      { t: 'NEVER', deep: false,
        d: '트랜잭션 없이 실행되어야 하며, 진행 중인 트랜잭션이 있으면 `IllegalTransactionStateException`을 던진다.',
        how: [
          '트랜잭션 안에서 호출되면 안 되는 작업을 명시적으로 막을 때 쓴다. 실무에서는 거의 쓰지 않는다.',
          '- MANDATORY의 반대다. 트랜잭션이 없으면 그대로 실행하고, 있으면 메서드를 실행하지 않고 예외를 던진다.',
          '- 쓰임 예: 외부 메시지 발행이나 긴 파일 처리처럼 트랜잭션 안에서 실행되면 락과 커넥션을 오래 잡는 작업이 실수로 트랜잭션 안에서 호출되는 것을 막는다.',
          '- 단순히 트랜잭션 밖에서 실행만 하고 싶다면 예외 없이 보류하는 NOT_SUPPORTED를 쓴다.'
        ],
        rel: ['MANDATORY'] }
    ]},
    { name: '격리 수준', items: [
      { t: 'READ UNCOMMITTED', deep: false,
        d: '다른 트랜잭션이 커밋하지 않은 변경까지 읽을 수 있는 가장 낮은 격리 수준이다.',
        how: [
          '- Dirty Read가 발생한다. A가 잔액을 바꾸고 커밋하기 전에 B가 그 값을 읽었는데 A가 롤백하면, B는 존재한 적 없는 값을 근거로 작업한 셈이 된다.',
          '- Non-Repeatable Read, Phantom Read도 모두 발생한다.',
          '- 정합성 문제가 커서 실무에서는 거의 쓰지 않는다.'
        ],
        rel: ['READ COMMITTED'] },
      { t: 'READ COMMITTED', deep: false,
        d: '커밋된 데이터만 읽는 격리 수준으로, PostgreSQL과 Oracle의 기본값이다.',
        how: [
          '- Dirty Read는 막는다.',
          '- Non-Repeatable Read가 발생한다. 같은 행을 두 번 읽는 사이 다른 트랜잭션이 수정·커밋하면 두 번째 조회 값이 달라진다.',
          '- MVCC 기반 DB는 쿼리(문장)마다 새 스냅샷을 만들어, 매번 그 시점까지 커밋된 최신 값을 읽는다.',
          '`@Transactional(isolation = Isolation.READ_COMMITTED)`처럼 지정하고, 기본값(DEFAULT)은 DB 설정을 따른다.'
        ],
        rel: ['READ UNCOMMITTED', 'REPEATABLE READ'] },
      { t: 'REPEATABLE READ', deep: false,
        d: '트랜잭션 안에서 같은 행은 몇 번을 읽어도 같은 값을 보장하는 격리 수준으로, MySQL InnoDB의 기본값이다.',
        how: [
          '- 트랜잭션의 첫 조회 시점 스냅샷을 끝까지 읽어 Non-Repeatable Read를 막는다.',
          '- 이론상 범위 조회에 새 행이 나타나는 Phantom Read가 가능하다.',
          '- MySQL InnoDB는 일반 조회는 MVCC 스냅샷으로, `SELECT ... FOR UPDATE` 같은 잠금 읽기는 갭 락과 넥스트 키 락으로 대부분의 팬텀을 막는다.'
        ],
        rel: ['READ COMMITTED', 'SERIALIZABLE'] },
      { t: 'SERIALIZABLE', deep: false,
        d: '트랜잭션들을 순서대로 하나씩 실행한 것과 같은 결과를 보장하는 가장 높은 격리 수준이다.',
        how: [
          '- Dirty Read, Non-Repeatable Read, Phantom Read를 모두 막는다.',
          '- MySQL은 일반 SELECT도 공유 락을 걸어, 읽은 행을 다른 트랜잭션이 수정하지 못하게 한다.',
          '- 락 경합과 대기가 크게 늘어 동시 처리 성능이 가장 낮다. 정합성이 극도로 중요하고 동시성이 낮은 작업에만 쓴다.'
        ],
        rel: ['REPEATABLE READ'] }
    ]},
    { name: '롤백 규칙', items: [
      { t: '롤백 규칙', deep: true,
        d: '스프링은 기본적으로 언체크 예외(`RuntimeException`과 하위)와 `Error`가 나면 롤백하고, 체크 예외는 커밋한다.',
        why: '모든 예외에서 롤백하면 "잔액 부족이라 결제는 실패했지만 주문은 결제 대기로 남긴다" 같은 비즈니스 흐름을 표현할 수 없다. 스프링은 체크 예외를 호출자가 처리할 수 있는 비즈니스 예외, 언체크 예외를 복구 불가능한 시스템 예외로 보는 관례를 따른다.',
        how: [
          '1) 프록시가 원본 메서드를 실행하다 예외를 잡는다.',
          '2) 예외 타입을 롤백 규칙과 비교한다. 기본 규칙은 `RuntimeException`과 `Error`.',
          '3) 롤백 대상이면 롤백, 아니면 커밋한 뒤 예외를 그대로 호출자에게 다시 던진다.',
          '- `rollbackFor`, `noRollbackFor`로 규칙을 바꿀 수 있다.',
          '- 예외를 메서드 안에서 catch해 삼키면 프록시는 예외를 보지 못해 커밋한다.',
          '이 규칙은 EJB 시절의 관례를 이어받은 것이다. 실무에서는 비즈니스 예외도 대부분 언체크로 만들어 기본 규칙만으로 롤백되게 한다.'
        ],
        code: `@Transactional
public void pay(Long orderId) throws InsufficientBalanceException {
    Order order = orderRepository.findById(orderId).orElseThrow();
    order.markWaiting();
    if (!wallet.hasEnough(order.getPrice())) {
        // 체크 예외: 기본 규칙으로는 커밋된다 (주문은 결제 대기로 남음)
        throw new InsufficientBalanceException();
    }
}

@Transactional(rollbackFor = Exception.class)   // 체크 예외도 롤백
public void importFile(Path path) throws IOException { ... }`,
        warn: [
          '`throws Exception`으로 선언된 체크 예외는 롤백되지 않는다. 의도와 다르면 `rollbackFor`를 지정한다.',
          'catch 블록에서 로그만 남기고 끝내면 커밋된다. 롤백이 필요하면 예외를 다시 던지거나 rollback-only로 표시한다.'
        ],
        qa: ['체크 예외가 발생하면 롤백되나요?',
          '기본 설정에서는 롤백되지 않고 커밋됩니다. 스프링은 런타임 예외와 Error만 롤백 대상으로 보고, 체크 예외는 호출자가 복구할 수 있는 비즈니스 예외로 간주하기 때문입니다. 체크 예외에도 롤백하려면 rollbackFor = Exception.class처럼 지정합니다.'],
        rel: ['rollbackFor 옵션', 'setRollbackOnly', '@Transactional 동작 원리'] },
      { t: 'rollbackFor 옵션', deep: false,
        d: '`@Transactional`의 기본 롤백 규칙을 예외 타입별로 바꾸는 속성이다.',
        how: [
          '- `rollbackFor = IOException.class`: 지정한 체크 예외와 하위 예외도 롤백한다.',
          '- `noRollbackFor = NotificationException.class`: 런타임 예외라도 지정한 예외는 커밋한다. 알림 실패처럼 부가 작업의 실패가 본 작업을 되돌리면 안 될 때 쓴다.',
          '- 규칙이 겹치면 예외 계층에서 더 가까운 규칙이 이긴다.'
        ],
        rel: ['롤백 규칙'] },
      { t: 'setRollbackOnly', deep: false,
        d: '예외를 던지지 않고도 현재 트랜잭션을 롤백하도록 표시하는 방법이다.',
        how: [
          '예외를 catch해서 정상 응답을 돌려주되 데이터 변경은 취소하고 싶을 때 쓴다.',
          '- `TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()`를 호출하면 메서드가 정상 종료해도 커밋 대신 롤백된다.',
          '- 코드가 스프링 트랜잭션 API에 직접 묶이므로, 가능하면 예외를 다시 던지는 방식이 더 명확하다.'
        ],
        rel: ['롤백 규칙', 'UnexpectedRollback 예외'] }
    ]},
    { name: '적용 안 되는 경우', items: [
      { t: 'private 메서드', deep: false,
        d: '`@Transactional`을 private 메서드에 붙이면 트랜잭션이 적용되지 않는다.',
        how: [
          'CGLIB 프록시는 대상 클래스를 상속해 메서드를 오버라이드하는 방식인데, private 메서드는 오버라이드할 수 없다.',
          '- 스프링 6.0 이전에는 public 메서드에만 적용되었다.',
          '- 스프링 6.0부터 CGLIB 프록시에서는 protected와 package-private 메서드에도 적용되지만 private은 여전히 안 된다.',
          '- final 메서드도 오버라이드할 수 없어 마찬가지다.'
        ],
        rel: ['@Transactional 동작 원리'] },
      { t: 'new로 만든 객체', deep: false,
        d: '`new`로 직접 생성한 객체는 스프링 빈이 아니므로 `@Transactional`이 붙어 있어도 프록시가 없어 적용되지 않는다.',
        how: [
          '트랜잭션은 컨테이너가 빈을 등록할 때 프록시로 바꿔 주는 방식이라, 컨테이너를 거치지 않은 객체에는 아무 효과가 없다.',
          '- 반드시 의존성 주입으로 받은 빈을 통해 호출한다.',
          '- 흔한 실수: 유틸 클래스나 서비스를 `new`로 만들어 쓰거나, 스레드·람다 안에서 `new SomeService()`로 생성해 호출한다.',
          '- `@Transactional`뿐 아니라 `@Async`, `@Cacheable`, `@Retryable`처럼 프록시로 동작하는 기능은 모두 같은 이유로 적용되지 않는다.',
          '- 직접 만든 객체에서 꼭 트랜잭션이 필요하면 `TransactionTemplate`으로 코드에서 트랜잭션을 연다.'
        ],
        rel: ['@Transactional 동작 원리'] },
      { t: '@PostConstruct 안의 트랜잭션', deep: false,
        d: '`@PostConstruct` 메서드에서 `@Transactional` 메서드를 호출하거나 직접 붙여도 트랜잭션이 적용되지 않을 수 있다.',
        how: [
          '`@PostConstruct`는 빈 초기화 단계에서 원본 객체에 대해 호출된다. AOP 프록시는 초기화가 끝난 뒤 BeanPostProcessor가 만들기 때문에, 이 시점의 호출은 프록시를 거치지 않는다.',
          '- 초기 데이터 적재처럼 기동 시 트랜잭션이 필요하면 `ApplicationReadyEvent`를 받는 `@EventListener`에서 실행한다. 이 시점에는 모든 빈과 프록시가 준비되어 있다.',
          '- 같은 빈 안의 다른 `@Transactional` 메서드를 호출하는 것은 셀프 호출이라 마찬가지로 프록시를 거치지 않는다.',
          '- 주입받은 다른 빈의 `@Transactional` 메서드는 보통 프록시를 통해 호출되지만, 스프링은 초기화 시점에 트랜잭션 인프라가 모두 준비되었다고 보장하지 않으므로 기대지 않는다.',
          '- `TransactionTemplate`을 주입받아 `@PostConstruct` 안에서 직접 트랜잭션을 여는 방법도 있다.'
        ],
        rel: ['@Transactional 동작 원리'] },
      { t: '다른 스레드에서의 트랜잭션', deep: false,
        d: '트랜잭션은 스레드에 묶여 있어, `@Async`나 새로 만든 스레드에서 실행된 작업은 호출한 쪽의 트랜잭션에 참여하지 않는다.',
        how: [
          '트랜잭션 동기화가 ThreadLocal로 커넥션을 보관하기 때문에, 다른 스레드에서는 그 커넥션을 볼 수 없다.',
          '- 비동기 작업에 트랜잭션이 필요하면 그 메서드에 따로 `@Transactional`을 붙여 독립된 트랜잭션으로 실행한다.',
          '- 외부 트랜잭션이 아직 커밋되기 전에 비동기 작업이 데이터를 읽으면 최신 데이터가 보이지 않는다. 커밋 후 실행하려면 `@TransactionalEventListener(phase = AFTER_COMMIT)`을 쓴다.'
        ],
        rel: ['트랜잭션 동기화', '트랜잭션 이벤트 리스너'] },
      { t: 'UnexpectedRollback 예외', deep: false,
        d: '참여한 내부 트랜잭션이 롤백 표시를 남겼는데 외부가 커밋을 시도할 때 발생하는 예외다.',
        how: [
          '1) 외부 REQUIRED 트랜잭션 안에서 내부 REQUIRED 메서드가 런타임 예외를 던진다.',
          '2) 내부는 신규 트랜잭션이 아니므로 실제 롤백 대신 물리 트랜잭션에 rollback-only 표시를 남긴다.',
          '3) 외부가 그 예외를 catch하고 정상적으로 끝나 커밋을 시도한다.',
          '4) 트랜잭션 매니저가 rollback-only 표시를 확인하고 롤백한 뒤, 커밋을 기대한 호출자에게 이 예외를 던진다.',
          '내부 실패를 외부와 분리하려면 내부를 REQUIRES_NEW로 바꾸거나, 내부를 호출하기 전에 실패 조건을 검사한다.'
        ],
        rel: ['REQUIRED', 'REQUIRES_NEW', '물리 · 논리 트랜잭션'] }
    ]},
    { name: '읽기 전용', items: [
      { t: 'readOnly', deep: false,
        d: '`@Transactional(readOnly = true)`는 이 트랜잭션이 데이터를 바꾸지 않는다는 힌트로, 여러 계층에서 최적화가 일어난다.',
        how: [
          '- 하이버네이트: 플러시 모드를 MANUAL로 바꿔 커밋 시 플러시하지 않고, 변경 감지용 스냅샷을 만들지 않아 메모리와 CPU를 아낀다.',
          '- JDBC 드라이버와 DB: `Connection.setReadOnly(true)`로 읽기 전용 트랜잭션 최적화를 할 수 있다.',
          '- 클래스에 `readOnly = true`를 두고 쓰기 메서드에만 `@Transactional`을 다시 붙이는 패턴이 흔하다.'
        ],
        warn: ['읽기 전용 트랜잭션에서 엔티티 값을 바꿔도 플러시되지 않아 DB에 반영되지 않는다. 쓰기 메서드에 실수로 붙지 않게 주의한다.'],
        rel: ['읽기 · 쓰기 DB 라우팅', '변경 감지'] },
      { t: '읽기 · 쓰기 DB 라우팅', deep: false,
        d: 'readOnly 여부를 보고 쓰기는 Primary DB, 읽기는 Replica DB로 보내 DB 부하를 나누는 방법이다.',
        how: [
          '`AbstractRoutingDataSource`를 상속해 `TransactionSynchronizationManager.isCurrentTransactionReadOnly()`로 대상을 고른다.',
          '- 트랜잭션이 시작된 뒤에 커넥션을 얻어야 readOnly 여부가 반영되므로 `LazyConnectionDataSourceProxy`로 감싼다.',
          '- 레플리카는 복제 지연이 있어, 방금 쓴 데이터를 바로 읽어야 하는 흐름은 Primary에서 읽게 한다.'
        ],
        rel: ['readOnly'] }
    ]},
    { name: '커밋 이후 처리', items: [
      { t: '트랜잭션 이벤트 리스너', deep: false,
        d: '트랜잭션의 특정 단계(기본은 커밋 직후)에 맞춰 이벤트를 처리하는 리스너다.',
        how: [
          '`ApplicationEventPublisher`로 발행한 이벤트를 `@TransactionalEventListener`가 받으면, 트랜잭션이 커밋된 뒤(AFTER_COMMIT)에 실행된다.',
          '- 가입 축하 메일, 메시지 발행처럼 DB 커밋이 확정된 뒤에만 해야 하는 일에 쓴다. 롤백되면 실행되지 않는다.',
          '- phase로 BEFORE_COMMIT, AFTER_ROLLBACK, AFTER_COMPLETION도 지정할 수 있다.'
        ],
        warn: ['AFTER_COMMIT 시점에는 원래 트랜잭션이 이미 끝나서, 리스너에서 DB를 바꾸려면 REQUIRES_NEW 트랜잭션이 필요하다.'],
        rel: ['REQUIRES_NEW', '다른 스레드에서의 트랜잭션'] }
    ]}
  ],
  must: [
    '트랜잭션은 ThreadLocal로 스레드에 묶인다. `@Async`로 넘긴 다른 스레드에는 이어지지 않는다.',
    '트랜잭션 안에서 외부 API를 호출하면 그동안 DB 커넥션을 붙잡고 있게 된다. 트랜잭션은 짧게 유지한다.',
    '클래스에 `@Transactional(readOnly = true)`를 두고 쓰기 메서드에만 `@Transactional`을 다시 붙이는 패턴이 흔하다.',
    '커밋이 확정된 뒤 할 일(알림, 메시지 발행)은 `@TransactionalEventListener(phase = AFTER_COMMIT)`로 처리한다.'
  ]
};
