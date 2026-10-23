(window.MINDMAP = window.MINDMAP || {})['spring-5'] = {
  name: 'JPA · 데이터',
  groups: [
    { name: '기술 계층', items: [
      { t: 'JPA', deep: false,
        d: 'JPA(Jakarta Persistence API)는 자바 객체와 관계형 DB 테이블을 연결하는 ORM 기술의 표준 명세다.',
        how: [
          '`@Entity`, `EntityManager`, JPQL 같은 인터페이스와 규칙만 정의하고 실제 구현은 없다.',
          '- 객체와 테이블의 패러다임 차이(상속, 연관관계, 객체 그래프 탐색)를 대신 해결해 준다.',
          '- 개발자는 SQL 대신 객체를 저장하고 조회하며, SQL은 구현체가 만든다.',
          '- 스프링 부트 3부터 패키지가 `javax.persistence`에서 `jakarta.persistence`로 바뀌었다.'
        ],
        rel: ['Hibernate', 'Spring Data JPA'] },
      { t: 'Hibernate', deep: false,
        d: 'JPA 명세의 대표 구현체로, 실제로 SQL을 만들어 실행하고 영속성 컨텍스트를 관리한다.',
        how: [
          '스프링 부트에서 JPA 스타터를 쓰면 기본 구현체로 하이버네이트가 들어온다. 내부적으로는 결국 JDBC로 SQL을 실행한다.',
          '- 방언(Dialect)으로 DB마다 다른 SQL 문법을 맞춘다.',
          '- 하이버네이트 6은 컬렉션 fetch join의 중복 엔티티를 자동으로 제거하는 등 동작이 일부 바뀌었다.',
          '- EclipseLink 같은 다른 구현체도 있다.'
        ],
        rel: ['JPA', '영속성 컨텍스트'] },
      { t: 'Spring Data JPA', deep: false,
        d: 'Repository 인터페이스만 선언하면 구현체를 자동으로 만들어 주는, JPA 위의 스프링 추상화 모듈이다.',
        how: [
          '`interface UserRepository extends JpaRepository<User, Long>`만 선언하면 런타임에 SimpleJpaRepository 기반 프록시가 빈으로 등록된다.',
          '- `save`, `findById`, `findAll`, `delete` 같은 기본 CRUD와 페이징, 정렬을 제공한다.',
          '- `findByEmailAndStatus`처럼 메서드 이름으로 쿼리를 만들고, 복잡한 쿼리는 `@Query`로 JPQL을 직접 쓴다.',
          '- 계층: 애플리케이션 → Spring Data JPA → JPA → Hibernate → JDBC → DB.'
        ],
        warn: ['`save()`는 id가 있는 엔티티를 넘기면 `merge`로 동작해 불필요한 SELECT가 나갈 수 있다.'],
        rel: ['JPA', 'merge'] },
      { t: 'JPQL', deep: false,
        d: '테이블이 아니라 엔티티 객체를 대상으로 쓰는 JPA의 객체 지향 쿼리 언어다.',
        how: [
          '`select m from Member m where m.age > :age`처럼 엔티티 이름과 필드 이름을 쓰고, 구현체가 이를 DB 방언에 맞는 SQL로 바꾼다.',
          '- JPQL을 실행하기 직전에는 자동으로 플러시가 일어나 영속성 컨텍스트의 변경이 먼저 반영된다.',
          '- 파라미터는 반드시 `:name` 바인딩을 쓴다. 문자열을 이어 붙이면 SQL 인젝션에 취약하다.',
          '- 동적 쿼리가 많으면 QueryDSL 같은 타입 안전한 빌더를 함께 쓴다.'
        ],
        rel: ['플러시', 'fetch join'] }
    ]},
    { name: '영속성 컨텍스트', items: [
      { t: '영속성 컨텍스트', deep: false,
        d: '엔티티를 보관하고 관리하는 논리적인 공간으로, EntityManager를 통해 접근한다.',
        how: [
          '엔티티를 조회하거나 저장하면 영속성 컨텍스트가 그 엔티티를 관리 대상으로 등록한다. 이후 1차 캐시, 동일성 보장, 쓰기 지연, 변경 감지, 지연 로딩이 이 공간을 바탕으로 동작한다.',
          '- 스프링에서는 기본적으로 트랜잭션과 생명주기가 같다(트랜잭션 범위 영속성 컨텍스트).',
          '- 같은 트랜잭션이면 여러 Repository가 같은 영속성 컨텍스트를 공유한다.',
          '- OSIV가 켜져 있으면 요청이 끝날 때까지 유지된다.'
        ],
        rel: ['1차 캐시', '변경 감지', 'OSIV'] },
      { t: '1차 캐시', deep: false,
        d: '영속성 컨텍스트 안에서 `@Id`를 키로 엔티티를 보관하는 맵으로, 같은 엔티티를 다시 조회하면 DB 대신 여기서 돌려준다.',
        how: [
          '1) `em.find(Member.class, 1L)`을 호출하면 먼저 1차 캐시를 찾는다.',
          '2) 없으면 DB에서 조회해 1차 캐시에 저장하고 반환한다.',
          '3) 같은 트랜잭션에서 다시 조회하면 SQL 없이 캐시에서 반환한다.',
          '- 트랜잭션이 끝나면 함께 사라지므로 성능 이득은 크지 않다. 애플리케이션 전체 공유 캐시(2차 캐시)와는 다르다.',
          '- JPQL 조회는 항상 SQL을 실행한 뒤, 이미 1차 캐시에 있는 엔티티는 캐시의 것을 돌려준다.'
        ],
        rel: ['동일성 보장', '영속성 컨텍스트'] },
      { t: '동일성 보장', deep: false,
        d: '같은 트랜잭션 안에서 같은 id로 조회한 엔티티는 항상 같은 인스턴스여서 `==` 비교가 true다.',
        how: [
          '1차 캐시 덕분에 두 번 조회해도 같은 객체를 돌려받는다.',
          '- 애플리케이션 수준에서 REPEATABLE READ와 비슷한 효과를 준다.',
          '- 영속성 컨텍스트가 다르면(트랜잭션이 다르면) 다른 인스턴스가 된다.'
        ],
        rel: ['1차 캐시'] },
      { t: '쓰기 지연', deep: false,
        d: '`persist` 시 INSERT를 바로 보내지 않고 쓰기 지연 SQL 저장소에 모았다가 플러시할 때 한꺼번에 보내는 기능이다.',
        how: [
          '- 트랜잭션 커밋 직전에 모아 둔 SQL을 순서대로 실행한다.',
          '- `hibernate.jdbc.batch_size`를 설정하면 여러 INSERT를 JDBC 배치로 묶어 보낼 수 있다.',
          '- 단, id 생성 전략이 IDENTITY면 DB가 id를 만들어야 하므로 persist 즉시 INSERT가 실행되고 배치 INSERT가 안 된다.'
        ],
        rel: ['플러시', '영속성 컨텍스트'] },
      { t: '변경 감지', deep: true,
        d: '영속 상태 엔티티의 값만 바꾸면, 플러시 시점에 처음 상태와 비교해 달라진 엔티티의 UPDATE를 자동으로 만들어 실행하는 기능(Dirty Checking)이다.',
        why: '객체의 필드를 바꾸는 것만으로 DB가 수정되므로, 수정할 때마다 `update()`를 호출하거나 SQL을 직접 쓸 필요가 없다. 엔티티를 컬렉션처럼 다룰 수 있게 해 주는 JPA의 핵심 기능이다.',
        how: [
          '1) 엔티티가 영속 상태가 될 때(조회나 persist) 그 시점의 값을 스냅샷으로 복사해 둔다.',
          '2) 트랜잭션 안에서 setter나 도메인 메서드로 필드 값을 바꾼다.',
          '3) 커밋 직전에 플러시가 일어나면 영속성 컨텍스트가 관리하는 모든 엔티티를 스냅샷과 비교한다.',
          '4) 달라진 엔티티의 UPDATE SQL을 만들어 쓰기 지연 저장소에 넣는다.',
          '5) 저장소의 SQL을 DB로 보내고 커밋한다.',
          '- 기본적으로 모든 컬럼을 UPDATE한다. 바뀐 컬럼만 보내려면 `@DynamicUpdate`를 쓴다.'
        ],
        code: `@Transactional
public void changeName(Long memberId, String newName) {
    Member member = memberRepository.findById(memberId).orElseThrow(); // 영속 상태 + 스냅샷
    member.changeName(newName);   // 값만 바꾼다. save() 호출 불필요
}   // 커밋 시 플러시 → 스냅샷과 비교 → UPDATE member SET name=? WHERE id=?`,
        warn: [
          '영속 상태 엔티티에만 동작한다. 준영속 엔티티(트랜잭션 밖에서 받은 객체)는 값을 바꿔도 반영되지 않는다.',
          '`readOnly = true` 트랜잭션에서는 플러시하지 않으므로 반영되지 않는다.',
          '엔티티가 많으면 스냅샷 비교 비용이 커진다. 대량 수정은 벌크 수정 쿼리를 쓴다.'
        ],
        qa: ['변경 감지는 어떻게 동작하나요?',
          '엔티티가 영속 상태가 될 때 최초 상태를 스냅샷으로 저장해 두고, 플러시 시점에 현재 엔티티와 스냅샷을 비교해 달라진 엔티티에 대한 UPDATE 쿼리를 자동으로 생성합니다. 그래서 트랜잭션 안에서 값만 바꾸면 save를 다시 호출하지 않아도 수정됩니다. 영속 상태일 때만 동작하므로 준영속 엔티티는 merge나 재조회가 필요합니다.'],
        rel: ['플러시', '준영속', 'readOnly', '벌크 수정 쿼리'] },
      { t: '플러시', deep: false,
        d: '영속성 컨텍스트의 변경 내용(쓰기 지연 SQL, 변경 감지 결과)을 DB에 동기화하는 작업이다.',
        how: [
          '- 발생 시점: 트랜잭션 커밋 직전, JPQL 실행 직전, `em.flush()` 직접 호출.',
          '- 플러시는 SQL을 DB에 보낼 뿐 커밋하지 않는다. 트랜잭션이 롤백되면 함께 취소된다.',
          '- 플러시해도 영속성 컨텍스트는 비워지지 않는다. 비우는 것은 `clear()`다.',
          '- 테스트에서 실제 SQL과 제약 조건 위반을 확인하려면 `em.flush()`를 직접 호출한다.'
        ],
        rel: ['쓰기 지연', '변경 감지', 'JPQL'] }
    ]},
    { name: '엔티티 상태', items: [
      { t: '비영속', deep: false,
        d: '`new Member()`로 객체를 만들기만 하고 영속성 컨텍스트와 아무 관계가 없는 상태(new/transient)다.',
        how: [
          '- JPA가 전혀 관리하지 않으므로 값을 바꿔도 DB와 무관하다.',
          '- `persist()`나 `save()`를 호출하면 영속 상태가 된다.',
          '- `@Id`에 값을 직접 넣었더라도 `persist()` 전이라면 비영속이다. 식별자가 있는지가 아니라 영속성 컨텍스트가 관리하는지가 기준이다.',
          '- Spring Data JPA의 `save()`는 `isNew()`로 새 엔티티인지 판단한다. ID를 직접 할당하는 엔티티는 새 엔티티로 보지 않아 `merge()`가 호출되고 불필요한 SELECT가 나간다. `Persistable`을 구현해 해결한다.',
          '- 비영속 객체를 영속 엔티티의 연관관계에 연결한 채 플러시하면 `TransientPropertyValueException`이 난다. 먼저 저장하거나 cascade를 설정한다.'
        ],
        rel: ['영속'] },
      { t: '영속', deep: false,
        d: '영속성 컨텍스트가 관리하는 상태(managed)로, persist로 저장했거나 조회해서 얻은 엔티티다.',
        how: [
          '- 1차 캐시에 저장되고 스냅샷이 만들어진다.',
          '- 변경 감지, 지연 로딩, 동일성 보장이 모두 동작한다.',
          '- 영속 상태가 된다고 바로 INSERT되는 것은 아니며, 플러시 때 DB에 반영된다.'
        ],
        rel: ['비영속', '준영속', '변경 감지'] },
      { t: '준영속', deep: false,
        d: '영속 상태였다가 영속성 컨텍스트에서 분리된 상태(detached)다.',
        how: [
          '- `detach()`, `clear()`, `close()`를 호출했거나, 트랜잭션이 끝나 영속성 컨텍스트가 닫히면 준영속이 된다.',
          '- id는 있지만 관리되지 않으므로 값을 바꿔도 변경 감지가 일어나지 않는다.',
          '- 초기화되지 않은 지연 로딩 필드에 접근하면 `LazyInitializationException`이 난다.',
          '- 컨트롤러가 받은 요청 DTO로 만든 엔티티나 트랜잭션 밖으로 반환된 엔티티가 대표적이다.'
        ],
        rel: ['merge', 'LazyInitialization 예외', '변경 감지'] },
      { t: '삭제', deep: false,
        d: '`remove()`로 삭제가 예약된 상태(removed)로, 플러시 때 DELETE가 실행된다.',
        how: [
          '- 영속성 컨텍스트와 DB에서 모두 삭제될 예정인 상태다.',
          '- `CascadeType.REMOVE`나 `orphanRemoval = true`가 설정된 자식도 함께 삭제된다.',
          '- `remove()`는 영속 엔티티에만 쓸 수 있다. 준영속 엔티티를 넘기면 `IllegalArgumentException`이 나므로 먼저 조회하거나 `merge()`한다.',
          '- Spring Data JPA의 `deleteById()`는 먼저 조회한 뒤 `remove()`하므로 SELECT 다음에 DELETE가 나간다. 대량 삭제는 `deleteAllInBatch()`나 벌크 쿼리를 쓴다.',
          '- 실무에서는 실제 삭제 대신 `deleted_at` 컬럼을 두는 소프트 삭제를 많이 쓴다. Hibernate 6.4+의 `@SoftDelete`나 `@SQLDelete`로 구현한다.'
        ],
        rel: ['영속'] },
      { t: 'merge', deep: false,
        d: '준영속 엔티티의 값을 새로 조회한 영속 엔티티에 복사해, 그 영속 엔티티를 반환하는 기능이다.',
        how: [
          '1) 넘겨받은 엔티티의 id로 1차 캐시나 DB에서 영속 엔티티를 찾는다.',
          '2) 준영속 엔티티의 모든 필드 값을 영속 엔티티에 덮어쓴다.',
          '3) 영속 엔티티를 반환한다. 넘긴 객체 자체는 여전히 준영속이다.',
          '실무에서는 merge 대신 id로 다시 조회한 뒤 필요한 필드만 바꾸는 변경 감지 방식을 권장한다.'
        ],
        warn: ['모든 필드를 덮어쓰므로 값이 없는 필드는 null로 바뀌어 데이터가 지워질 수 있다.'],
        rel: ['준영속', '변경 감지', 'Spring Data JPA'] }
    ]},
    { name: '로딩 전략', items: [
      { t: '지연 로딩', deep: false,
        d: '연관 엔티티를 바로 조회하지 않고 프록시를 넣어 두었다가, 실제 값에 접근하는 시점에 조회하는 방식(`FetchType.LAZY`)이다.',
        how: [
          '`order.getMember()`까지는 프록시가 반환되고, `order.getMember().getName()`처럼 실제 필드에 접근할 때 SELECT가 나간다.',
          '- `@OneToMany`, `@ManyToMany`의 기본값이다.',
          '- 실무 원칙은 모든 연관관계를 LAZY로 두고, 함께 필요한 경우에만 fetch join으로 가져오는 것이다.',
          '- 영속성 컨텍스트가 열려 있어야 동작한다.'
        ],
        rel: ['즉시 로딩', '프록시 객체', 'fetch join'] },
      { t: '즉시 로딩', deep: false,
        d: '엔티티를 조회할 때 연관 엔티티도 함께 조회하는 방식(`FetchType.EAGER`)이다.',
        how: [
          '- `@ManyToOne`, `@OneToOne`의 기본값이다. 그래서 직접 `fetch = FetchType.LAZY`로 바꿔야 한다.',
          '- `em.find()`는 조인으로 한 번에 가져오지만, JPQL은 JPQL을 먼저 실행한 뒤 연관 엔티티를 건마다 따로 조회해 N+1이 쉽게 생긴다.',
          '- 쓰지 않는 연관 엔티티까지 항상 조회하고, 어떤 SQL이 나갈지 예측하기 어렵다.'
        ],
        rel: ['지연 로딩', 'N+1 문제'] },
      { t: '프록시 객체', deep: false,
        d: '지연 로딩을 위해 실제 엔티티 대신 넣어 두는, 엔티티 클래스를 상속한 가짜 객체다.',
        how: [
          '프록시는 실제 엔티티의 참조를 가지고 있다가, 처음 메서드가 호출되면 영속성 컨텍스트에 초기화를 요청해 DB에서 실제 엔티티를 가져온다.',
          '- 초기화는 처음 한 번만 일어나고, 이후에는 실제 엔티티로 위임한다.',
          '- `getId()`는 프록시가 이미 id를 가지고 있어 초기화 없이 반환된다.',
          '- 원본을 상속한 클래스이므로 타입 비교에 `getClass() ==` 대신 `instanceof`를 쓴다.'
        ],
        rel: ['지연 로딩', 'LazyInitialization 예외'] },
      { t: 'LazyInitialization 예외', deep: false,
        d: '영속성 컨텍스트가 닫힌 뒤 초기화되지 않은 프록시나 지연 로딩 컬렉션에 접근할 때 나는 예외다.',
        how: [
          'OSIV를 끈 상태에서 서비스가 엔티티를 반환하고, 컨트롤러나 JSON 직렬화 과정에서 연관 필드에 접근하면 자주 발생한다.',
          '- 서비스 계층(트랜잭션 안)에서 필요한 연관 데이터를 fetch join으로 미리 조회한다.',
          '- 엔티티 대신 DTO로 변환해 반환한다.',
          '- `Hibernate.initialize()`로 강제 초기화할 수도 있다.'
        ],
        rel: ['OSIV', '프록시 객체', 'fetch join'] }
    ]},
    { name: 'N+1 문제', items: [
      { t: 'N+1 문제', deep: true,
        d: '목록을 조회하는 쿼리 1번 뒤에, 각 엔티티의 연관 데이터를 조회하는 쿼리가 건마다 N번 추가로 실행되는 문제다.',
        why: '쿼리 수가 데이터 건수에 비례해 늘어나 목록 화면 하나에 수백 번의 쿼리가 나갈 수 있다. JPA 성능 문제 중 가장 흔하고 면접 단골이다.',
        how: [
          '1) `findAll()`로 회원 10명을 조회한다. (쿼리 1번)',
          '2) 반복문에서 `member.getOrders().size()`처럼 각 회원의 연관 컬렉션에 접근한다.',
          '3) 지연 로딩 프록시가 초기화되며 회원마다 주문 조회 쿼리가 1번씩 나간다. (쿼리 10번)',
          '4) 결과적으로 1 + 10번이 실행된다.',
          'EAGER는 조회 직후에, LAZY는 연관 데이터에 접근하는 시점에 발생할 뿐 둘 다 생긴다. 즉 LAZY로 바꾸는 것만으로는 해결되지 않는다.',
          '- 해결책: fetch join, `@EntityGraph`, 배치 사이즈, DTO 직접 조회'
        ],
        code: `// 문제: 쿼리 1 + N번
List<Member> members = memberRepository.findAll();
for (Member m : members) {
    m.getOrders().size();   // 회원마다 SELECT * FROM orders WHERE member_id = ?
}

// 해결: fetch join으로 한 번에
@Query("select distinct m from Member m join fetch m.orders")
List<Member> findAllWithOrders();`,
        warn: [
          '로그에 SQL을 켜서(`spring.jpa.show-sql`, p6spy) 실제 쿼리 수를 확인하는 습관을 들인다.',
          '컬렉션 fetch join은 페이징과 함께 쓸 수 없으므로 상황에 맞는 해결책을 고른다.'
        ],
        qa: ['N+1 문제의 원인과 해결 방법은?',
          '목록을 한 번 조회한 뒤 각 엔티티의 연관 데이터를 지연 로딩하면서 건마다 추가 쿼리가 나가는 문제입니다. EAGER든 LAZY든 발생 시점만 다를 뿐 생길 수 있습니다. 주로 fetch join이나 @EntityGraph로 한 번에 조회하고, 컬렉션 페이징이 필요하면 default_batch_fetch_size로 IN 쿼리로 묶어서 해결합니다.'],
        rel: ['fetch join', '@EntityGraph', '배치 사이즈', 'DTO 직접 조회', '지연 로딩'] },
      { t: 'fetch join', deep: true,
        d: 'JPQL에서 `join fetch`로 연관 엔티티나 컬렉션을 한 번의 SQL 조인으로 함께 조회하는 JPA 전용 기능이다.',
        why: '지연 로딩으로 인한 N+1을 가장 확실하게 없애고, 필요한 시점에만 연관 데이터를 함께 가져와 LAZY 기본 전략과 조회 성능을 모두 챙길 수 있다.',
        how: [
          '1) `select o from Order o join fetch o.member`를 실행한다.',
          '2) 하이버네이트가 SQL에서 orders와 member를 조인하고 두 테이블의 컬럼을 모두 SELECT한다.',
          '3) 결과로 Order와 Member 엔티티를 함께 만들어 영속성 컨텍스트에 넣는다. member 필드에는 프록시가 아닌 실제 엔티티가 들어간다.',
          '- 일반 join은 조건 필터링에만 쓰이고 연관 엔티티를 채우지 않는다. fetch join은 채운다.',
          '- 다대일·일대일 fetch join은 결과 행이 늘지 않아 페이징도 안전하다.',
          '- 일대다 컬렉션 fetch join은 행이 부모 × 자식 수만큼 늘어난다. 하이버네이트 6부터 중복 엔티티를 자동으로 제거하며, 이전에는 `distinct`가 필요했다.'
        ],
        code: `public interface OrderRepository extends JpaRepository<Order, Long> {
    // 다대일: 페이징과 함께 써도 안전
    @Query("select o from Order o join fetch o.member where o.status = :status")
    List<Order> findWithMember(@Param("status") OrderStatus status);

    // 일대다 컬렉션: 페이징 불가, 컬렉션은 하나만
    @Query("select o from Order o join fetch o.orderItems where o.id = :id")
    Optional<Order> findWithItems(@Param("id") Long id);
}`,
        warn: [
          '컬렉션 fetch join에 페이징을 쓰면 DB가 아니라 메모리에서 페이징해 경고 로그와 함께 전체 데이터를 읽는다.',
          '컬렉션(List) 두 개 이상을 동시에 fetch join하면 `MultipleBagFetchException`이 난다.',
          'fetch join 대상에 별칭을 주고 where로 걸러 내면 컬렉션 일부만 담겨 정합성이 깨질 수 있다.'
        ],
        qa: ['fetch join과 일반 join의 차이, 그리고 한계는?',
          '일반 join은 조인 대상을 조건 필터링에만 쓰고 연관 엔티티를 채우지 않지만, fetch join은 연관 엔티티까지 한 번의 쿼리로 조회해 영속성 컨텍스트에 올립니다. 다대일은 페이징에도 안전하지만, 일대다 컬렉션 fetch join은 페이징이 메모리에서 일어나고 둘 이상의 컬렉션은 동시에 fetch join할 수 없습니다. 이때는 배치 사이즈 설정으로 보완합니다.'],
        rel: ['N+1 문제', '배치 사이즈', '@EntityGraph'] },
      { t: '@EntityGraph', deep: false,
        d: 'Spring Data JPA 메서드에 애너테이션으로 fetch join을 적용하는 방법이다.',
        how: [
          '`@EntityGraph(attributePaths = {"member", "delivery"})`를 Repository 메서드에 붙이면 지정한 연관관계를 LEFT OUTER JOIN으로 함께 조회한다.',
          '- JPQL을 직접 쓰지 않고 메서드 이름 쿼리에도 적용할 수 있다.',
          '- 간단한 경우에 편하고, 복잡한 조건이 있으면 `@Query` + fetch join이 명확하다.',
          '- fetch join과 같은 제약(컬렉션 페이징 불가)을 가진다.'
        ],
        code: `@EntityGraph(attributePaths = "member")
List<Order> findByStatus(OrderStatus status);`,
        rel: ['fetch join', 'N+1 문제'] },
      { t: '배치 사이즈', deep: false,
        d: '지연 로딩할 프록시나 컬렉션을 정해진 개수만큼 모아 `IN (...)` 쿼리 하나로 조회하게 하는 설정이다.',
        how: [
          '`spring.jpa.properties.hibernate.default_batch_fetch_size=100`으로 전역 설정하거나 `@BatchSize(size = 100)`로 개별 설정한다.',
          '- 회원 100명의 주문을 지연 로딩하면 쿼리 100번 대신 `WHERE member_id IN (?, ?, ...)` 쿼리 1번으로 줄어든다. 1 + N이 1 + N/100이 된다.',
          '- 컬렉션 fetch join이 안 되는 페이징 조회에서 가장 많이 쓰는 해결책이다. 부모는 페이징 쿼리로, 자식 컬렉션은 배치로 가져온다.',
          '- 보통 100~1000 사이 값을 쓴다.'
        ],
        rel: ['N+1 문제', 'fetch join'] },
      { t: 'DTO 직접 조회', deep: false,
        d: '엔티티 대신 화면이나 API에 필요한 컬럼만 DTO로 바로 조회하는 방법이다.',
        how: [
          '- JPQL `select new com.shop.OrderDto(o.id, m.name) from Order o join o.member m`이나 QueryDSL 프로젝션, 인터페이스 기반 프로젝션을 쓴다.',
          '- 필요한 컬럼만 SELECT해 데이터 전송량이 줄고, 엔티티가 아니므로 변경 감지와 지연 로딩이 없다.',
          '- 대신 화면에 맞춘 쿼리라 재사용성이 낮다. 조회 전용 Repository로 분리하는 경우가 많다.'
        ],
        rel: ['N+1 문제', 'fetch join'] }
    ]},
    { name: 'OSIV', items: [
      { t: 'OSIV', deep: true,
        d: 'Open Session In View는 영속성 컨텍스트와 DB 커넥션을 HTTP 요청 시작부터 응답이 끝날 때까지 열어 두는 방식이다.',
        why: '트랜잭션이 끝난 컨트롤러나 뷰에서도 지연 로딩을 할 수 있게 해 개발은 편해지지만, 커넥션을 오래 붙잡아 트래픽이 많은 서비스에서 장애 원인이 될 수 있어 켜고 끄는 기준을 알아야 한다.',
        how: [
          '1) 요청이 들어오면 OpenEntityManagerInViewInterceptor가 영속성 컨텍스트를 연다.',
          '2) 서비스의 트랜잭션이 끝나도 영속성 컨텍스트는 닫히지 않는다. 트랜잭션이 끝났으므로 수정은 반영되지 않고 조회만 된다.',
          '3) 컨트롤러와 뷰에서 지연 로딩하면 이 영속성 컨텍스트가 DB 커넥션으로 조회한다.',
          '4) 응답이 끝나면 영속성 컨텍스트를 닫고 커넥션을 반환한다.',
          '- 스프링 부트는 기본값이 true이며 기동 시 경고 로그(`spring.jpa.open-in-view is enabled by default`)를 남긴다.',
          '- 끄면(false) 트랜잭션이 끝날 때 영속성 컨텍스트와 커넥션도 함께 닫힌다.'
        ],
        code: `# application.yml
spring:
  jpa:
    open-in-view: false   # 트래픽이 많은 API 서버 권장

// OSIV를 끄면 서비스에서 필요한 데이터를 모두 조회해 DTO로 반환
@Transactional(readOnly = true)
public OrderDetailDto getOrder(Long id) {
    Order order = orderRepository.findWithMemberAndItems(id).orElseThrow();
    return OrderDetailDto.from(order);
}`,
        warn: [
          '켜 두면 외부 API 호출이나 느린 렌더링 동안에도 커넥션을 붙잡아 커넥션 풀이 고갈될 수 있다.',
          '끄면 트랜잭션 밖의 지연 로딩은 모두 `LazyInitializationException`이 난다. 서비스 계층에서 fetch join과 DTO 변환을 끝내야 한다.',
          '조회 전용 서비스(QueryService)를 따로 두면 OSIV를 꺼도 코드 구조를 깔끔하게 유지할 수 있다.'
        ],
        qa: ['OSIV란 무엇이고, 끄면 무엇을 신경 써야 하나요?',
          'OSIV는 영속성 컨텍스트를 요청 끝까지 열어 두어 컨트롤러나 뷰에서도 지연 로딩을 가능하게 하는 설정입니다. 대신 요청 처리 내내 DB 커넥션을 붙잡아 트래픽이 많으면 커넥션이 부족해집니다. 그래서 API 서버에서는 보통 끄고, 트랜잭션 안에서 fetch join으로 필요한 데이터를 조회해 DTO로 변환해 반환합니다.'],
        rel: ['LazyInitialization 예외', '영속성 컨텍스트', 'fetch join', 'DTO 직접 조회'] }
    ]},
    { name: '연관관계 · 대량 수정', items: [
      { t: '연관관계의 주인', deep: false,
        d: '양방향 연관관계에서 외래 키를 실제로 관리(등록, 수정)하는 쪽으로, 외래 키가 있는 테이블의 엔티티가 주인이다.',
        how: [
          '테이블은 외래 키 하나로 양방향 조회가 되지만, 객체는 양쪽에 참조가 하나씩 있어 어느 쪽 값으로 외래 키를 바꿀지 정해야 한다.',
          '- 보통 다(N) 쪽인 `@ManyToOne`이 주인이다.',
          '- 주인이 아닌 쪽은 `@OneToMany(mappedBy = "member")`로 표시하며 읽기 전용이다. 여기에만 값을 넣으면 DB에 반영되지 않는다.',
          '- 객체 상태를 맞추기 위해 양쪽에 함께 값을 설정하는 연관관계 편의 메서드를 둔다.'
        ],
        warn: ['양방향 관계에서 `toString`, JSON 직렬화가 서로를 계속 호출해 무한 루프에 빠질 수 있다. 엔티티 대신 DTO로 응답한다.'],
        rel: ['지연 로딩'] },
      { t: '벌크 수정 쿼리', deep: false,
        d: '`@Modifying`과 `@Query`로 여러 행을 한 번의 UPDATE·DELETE로 처리하는 쿼리다.',
        how: [
          '변경 감지는 엔티티마다 UPDATE를 보내므로 수만 건을 바꾸면 느리다. `update Product p set p.price = p.price * 1.1 where p.category = :c` 같은 벌크 쿼리는 한 번에 처리한다.',
          '- 영속성 컨텍스트를 거치지 않고 DB에 바로 실행된다.',
          '- 그래서 이미 1차 캐시에 있는 엔티티는 옛날 값을 그대로 가지고 있게 된다.',
          '- `@Modifying(clearAutomatically = true)`로 실행 후 영속성 컨텍스트를 비워, 이후 조회가 DB의 최신 값을 읽게 한다.'
        ],
        code: `@Modifying(clearAutomatically = true)
@Query("update Product p set p.price = p.price * 1.1 where p.category = :category")
int raisePrice(@Param("category") Category category);`,
        rel: ['변경 감지', '1차 캐시'] }
    ]}
  ],
  must: [
    '엔티티를 API 응답으로 그대로 반환하지 않는다. DTO로 바꿔야 지연 로딩 예외와 순환 참조를 피한다.',
    '컬렉션 fetch join은 페이징이 메모리에서 일어나고, 컬렉션 2개 이상은 `MultipleBagFetchException`이 난다.',
    '`save()`는 id가 이미 있으면 `merge`로 동작해 불필요한 select가 나갈 수 있다.',
    '벌크 수정(`@Modifying`)은 영속성 컨텍스트를 거치지 않으므로 `clearAutomatically = true`로 비운다.',
    '양방향 연관관계의 주인은 외래 키가 있는 쪽이다. 주인만 DB에 반영된다.'
  ]
};
