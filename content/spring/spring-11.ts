import type { Topic } from '../types';

const topic: Topic = {
  key: "spring-11",
  name: "캐시 · 메시징",
  must: [
    "캐시 애너테이션은 트랜잭션처럼 AOP 프록시로 동작한다. 같은 클래스 안 셀프 호출이나 private 메서드에는 캐시가 적용되지 않는다.",
    "캐시는 DTO를 TTL과 함께 저장하고, 쓰기 시에는 DB 커밋 후 캐시를 삭제하는 것이 기본 패턴이다.",
    "Kafka 소비는 at-least-once가 기본이다. 리스너는 반드시 멱등하게 만들고, 실패 메시지는 DefaultErrorHandler와 DLT로 다룬다.",
    "DB 트랜잭션과 Kafka 전송은 원자적으로 묶이지 않는다. 함께 보장해야 하면 트랜잭셔널 아웃박스를 쓴다.",
    "`@EventListener`는 기본이 동기·같은 트랜잭션이다. 커밋 후 처리는 `@TransactionalEventListener`, 별도 스레드는 `@Async`를 더한다."
  ],
  groups: [
    {
      name: "캐시 추상화",
      compare: {
        cols: ["기준", "@Cacheable", "@CachePut", "@CacheEvict"],
        rows: [
          ["메서드 실행", "캐시 미스일 때만", "항상", "항상"],
          ["캐시 동작", "조회 후 없으면 저장", "결과로 덮어쓰기", "키 또는 전체 삭제"],
          ["주로 붙이는 곳", "조회 메서드", "수정 후 결과를 반환하는 메서드", "수정·삭제 메서드"],
          ["주의점", "셀프 호출, 엔티티 캐시", "롤백 시 캐시만 바뀜", "커밋 전 삭제 시 옛 값 재적재"]
        ]
      },
      concepts: [
        {
          id: "spring/kaesi-chusanghwa",
          slug: "kaesi-chusanghwa",
          title: "캐시 추상화",
          deep: false,
          def: "`@EnableCaching`으로 켜는 스프링의 캐시 기능으로, 메서드 호출 결과를 저장해 두고 같은 인자로 다시 호출되면 메서드를 실행하지 않고 저장된 값을 돌려준다.",
          why: "캐시 코드를 비즈니스 로직에 섞지 않고, 저장소를 바꿔도 코드 수정 없이 반복 조회 비용을 줄이기 위해서다.",
          how: [
            "`@EnableCaching`을 붙이면 `@Cacheable` 같은 캐시 애너테이션이 붙은 빈을 AOP 프록시로 감싼다. 트랜잭션과 같은 프록시 기반 기능이다.",
            "비즈니스 코드는 `Cache`, `CacheManager` 인터페이스에만 의존하고, 실제 저장소(ConcurrentMap, Caffeine, Redis)는 설정으로 바꾼다.",
            "스프링 부트는 클래스패스를 보고 CacheManager를 자동 설정한다. 아무것도 없으면 TTL이 없는 `ConcurrentMapCacheManager`(simple)가 쓰인다.",
            "- 대상: 조회가 잦고 잘 바뀌지 않으며, 같은 입력이면 같은 결과가 나오는 메서드.",
            "- 비대상: 사용자마다 결과가 달라지는데 키에 사용자가 빠진 경우, 실시간 정확성이 필요한 재고·잔액."
          ],
          use: ["상품 상세 조회에 캐시를 붙여 DB 조회를 크게 줄인다.", "개발 환경은 simple 캐시, 운영은 Redis 캐시로 설정만 바꿔 같은 코드를 쓴다."],
          warn: ["프록시 기반이라 같은 클래스 안에서 `this.find()`로 호출하면 캐시가 적용되지 않는다. private 메서드에도 적용되지 않는다."],
          myth: [
            [
              "@EnableCaching만 켜면 기본 캐시도 알아서 만료된다.",
              "부트 기본 simple 캐시(ConcurrentMap)는 TTL과 크기 제한이 없다. 만료가 필요하면 Caffeine이나 Redis를 설정한다."
            ]
          ],
          answer: "스프링 캐시 추상화는 @EnableCaching으로 켜고, @Cacheable 같은 애너테이션이 붙은 메서드를 AOP 프록시로 감싸 결과를 캐시에 저장합니다. 코드는 CacheManager 인터페이스에만 의존하고 실제 저장소는 Caffeine이나 Redis로 설정만 바꿔 교체할 수 있습니다. 트랜잭션과 같은 프록시 방식이라 셀프 호출에는 적용되지 않는다는 점을 주의합니다.",
          analogy: "자주 묻는 질문에 대한 답을 메모지에 적어 두는 비서와 같습니다. 같은 질문이 오면 다시 조사하지 않고 메모를 읽어 줍니다.",
          followUps: [
            [
              "캐시를 적용할 메서드는 어떻게 고르나요?",
              "호출 빈도가 높고, 결과가 잘 바뀌지 않으며, 같은 입력에 같은 결과가 나오는 조회를 고릅니다. 히트율을 Micrometer 메트릭으로 확인해 효과가 없으면 제거합니다."
            ]
          ],
          related: [
            "spring/cacheable",
            "spring/cachemanager",
            "spring/selpeu-hochul-munje",
            "spring/transactional-dongjak-wonri"
          ]
        },
        {
          id: "spring/cacheable",
          slug: "cacheable",
          title: "@Cacheable",
          deep: true,
          def: "캐시에 값이 있으면 메서드를 건너뛰고 캐시 값을 반환하고, 없으면 메서드를 실행한 뒤 결과를 캐시에 넣는 애너테이션이다.",
          why: "DB나 외부 API처럼 비싼 조회를 반복하지 않아 응답 시간과 부하를 줄이면서도, 캐시 처리 코드를 비즈니스 로직과 분리하기 위해서다.",
          how: [
            "1) 프록시가 호출을 가로채 캐시 이름과 키(기본은 메서드 인자)를 계산한다.",
            "2) `condition`이 거짓이면 캐시를 쓰지 않고 바로 메서드를 실행한다.",
            "3) 캐시에 값이 있으면(hit) 메서드를 실행하지 않고 그 값을 반환한다.",
            "4) 없으면(miss) 메서드를 실행하고, `unless`가 거짓일 때만 결과를 캐시에 넣는다.",
            "- `key`: SpEL로 키 지정. `#id`, `#user.id`처럼 인자를 참조한다.",
            "- `condition`: 호출 전에 평가해 캐시 사용 여부를 정한다.",
            "- `unless`: 호출 후 `#result`를 보고 저장을 거부한다. `unless = \"#result == null\"`이 대표적이다.",
            "- `sync = true`: 같은 키를 동시에 조회할 때 한 스레드만 메서드를 실행하게 한다.",
            "`Optional`을 반환하면 내부 값이 캐시되고, 값이 없으면 null로 취급된다."
          ],
          flow: ["프록시가 호출 가로챔", "캐시 이름·키 계산", "condition 평가", "캐시 조회", "히트면 바로 반환", "미스면 메서드 실행", "unless 평가 후 저장"],
          code: "@Configuration\n@EnableCaching\npublic class CacheConfig { }\n\n@Service\n@RequiredArgsConstructor\npublic class ProductService {\n    private final ProductRepository productRepository;\n\n    @Cacheable(cacheNames = \"product\", key = \"#id\", unless = \"#result == null\")\n    public ProductDto findProduct(Long id) {\n        return productRepository.findById(id).map(ProductDto::from).orElse(null);\n    }\n\n    @CacheEvict(cacheNames = \"product\", key = \"#id\")\n    @Transactional\n    public void updatePrice(Long id, int price) {\n        productRepository.findById(id).orElseThrow().changePrice(price);\n    }\n}",
          codeLang: "java",
          use: ["상품 상세, 카테고리 목록처럼 조회가 압도적으로 많은 API에 붙인다.", "외부 환율 API 결과를 10분 TTL로 캐시해 호출 비용과 지연을 줄인다."],
          warn: [
            "엔티티를 그대로 캐시하면 지연 로딩 프록시와 직렬화 문제가 생긴다. 필요한 값만 담은 DTO를 캐시한다.",
            "로컬 캐시는 같은 객체 참조를 반환하므로 꺼낸 객체를 수정하면 캐시 내용이 바뀐다. 불변 객체를 캐시한다.",
            "TTL을 정하지 않으면 영원히 남는다. 기본 simple 캐시는 TTL과 크기 제한이 없다."
          ],
          myth: [["@Cacheable을 붙이면 같은 클래스 안에서 호출해도 캐시된다.", "프록시를 거치지 않는 this 호출에는 적용되지 않는다. 캐시 메서드를 다른 빈으로 분리한다."]],
          answer: "@Cacheable은 캐시에 값이 있으면 메서드를 실행하지 않고 그 값을 반환하고, 없으면 메서드를 실행한 뒤 결과를 저장합니다. 키는 기본적으로 메서드 인자로 만들고, key 속성에 SpEL로 직접 지정할 수 있습니다. unless로 null 결과를 저장하지 않게 하고, 엔티티 대신 DTO를 캐시합니다.",
          qa: [
            "@Cacheable이 동작하지 않는 경우는 언제인가요?",
            "프록시 기반이라 같은 클래스 안에서 this로 호출하면 프록시를 거치지 않아 캐시가 적용되지 않습니다. private 메서드나 new로 만든 객체, @EnableCaching을 빠뜨린 경우도 마찬가지입니다. 또 unless나 condition 조건, 키가 매번 달라지는 경우에도 캐시 히트가 나지 않습니다."
          ],
          followUps: [
            [
              "캐시에 엔티티를 그대로 넣으면 어떤 문제가 있나요?",
              "지연 로딩 프록시가 포함되어 직렬화가 실패하거나 LazyInitializationException이 날 수 있고, 로컬 캐시에서는 꺼낸 엔티티를 수정하면 캐시 내용까지 바뀝니다. 그래서 필요한 값만 담은 불변 DTO를 캐시합니다."
            ],
            [
              "condition과 unless는 어떻게 다른가요?",
              "condition은 메서드 호출 전에 평가해 캐시를 아예 쓸지 정하고, unless는 호출 후 #result를 보고 저장만 막습니다. 결과값 기준 판단은 unless로만 가능합니다."
            ]
          ],
          related: [
            "spring/kaesi-chusanghwa",
            "spring/cacheput",
            "spring/cacheevict",
            "spring/kaesi-ki-seolgye",
            "spring/kaesi-seutaempideu",
            "spring/selpeu-hochul-munje"
          ]
        },
        {
          id: "spring/cacheput",
          slug: "cacheput",
          title: "@CachePut",
          deep: false,
          def: "메서드를 항상 실행하고 그 결과로 캐시 값을 갱신하는 애너테이션이다.",
          why: "데이터를 수정한 뒤에도 캐시에 이전 값이 남아 사용자가 오래된 데이터를 보는 것을 막기 위해서다.",
          how: [
            "`@Cacheable`과 달리 캐시 조회를 하지 않는다. 수정 메서드가 바뀐 결과를 반환할 때 캐시를 최신 값으로 덮어쓴다.",
            "키는 조회 메서드와 정확히 같아야 한다. 보통 `key = \"#result.id\"`나 `key = \"#id\"`를 쓴다.",
            "같은 메서드에 `@Cacheable`과 함께 붙이지 않는다. 동작이 충돌한다."
          ],
          use: ["프로필 수정 API가 수정된 프로필 DTO를 반환하면서 같은 키의 캐시를 갱신한다."],
          warn: ["트랜잭션 안에서 캐시를 먼저 갱신한 뒤 커밋이 롤백되면 캐시에만 바뀐 값이 남는다. 갱신보다 삭제(`@CacheEvict`)가 더 안전한 경우가 많다."],
          answer: "@CachePut은 메서드를 항상 실행하고 그 반환값으로 캐시를 덮어씁니다. 수정 직후 최신 값을 캐시에 미리 넣고 싶을 때 쓰며, 키를 조회 메서드와 정확히 맞춰야 합니다. 다만 동시성과 롤백 문제 때문에 실무에서는 삭제를 더 많이 씁니다.",
          followUps: [
            [
              "@CachePut 대신 @CacheEvict를 선호하는 이유는?",
              "두 요청이 동시에 수정하면 늦게 끝난 요청이 옛 값으로 캐시를 덮어쓸 수 있고, 트랜잭션이 롤백되면 캐시에만 바뀐 값이 남습니다. 삭제는 다음 조회가 DB에서 최신 값을 읽으므로 이런 문제가 적습니다."
            ]
          ],
          related: ["spring/cacheable", "spring/cacheevict", "spring/kaesi-ilgwanseong"]
        },
        {
          id: "spring/cacheevict",
          slug: "cacheevict",
          title: "@CacheEvict",
          deep: false,
          def: "메서드 실행 후 지정한 키 또는 캐시 전체를 삭제하는 애너테이션이다.",
          why: "원본 데이터가 바뀌거나 삭제된 뒤에도 캐시가 옛 값을 계속 돌려주는 것을 막기 위해서다.",
          how: [
            "데이터가 바뀌는 수정·삭제 메서드에 붙여 다음 조회 때 최신 값을 다시 읽게 한다.",
            "- `key`: 특정 키만 삭제한다.",
            "- `allEntries = true`: 캐시 이름에 속한 전체를 비운다. 목록 캐시처럼 어떤 키가 영향받는지 알기 어려울 때 쓴다.",
            "- `beforeInvocation = true`: 메서드 실행 전에 삭제한다. 기본은 메서드가 정상 종료된 뒤 삭제하며, 예외가 나면 삭제하지 않는다.",
            "여러 캐시를 한 번에 다룰 때는 `@Caching(evict = {...})`로 묶는다."
          ],
          use: ["상품 가격 수정 시 `product::{id}` 키를 삭제한다.", "카테고리 구조 변경 시 `allEntries = true`로 카테고리 캐시 전체를 비운다."],
          warn: [
            "Redis 캐시의 `allEntries = true`는 기본으로 KEYS 명령으로 키를 찾아 지워 키가 많으면 Redis 전체가 멈출 수 있다. `RedisCacheWriter`에 `BatchStrategies.scan(1000)`을 지정해 SCAN으로 나눠 지운다."
          ],
          myth: [
            [
              "@CacheEvict는 트랜잭션 커밋 후에 실행된다.",
              "프록시 순서에 따라 커밋 전에 삭제될 수 있다. 커밋 후를 보장하려면 transactionAware 캐시나 커밋 후 이벤트를 쓴다."
            ]
          ],
          answer: "@CacheEvict는 데이터가 바뀌는 메서드에 붙여 해당 키나 캐시 전체를 삭제합니다. 기본으로 메서드가 정상 종료된 뒤 삭제하고, beforeInvocation으로 실행 전에 지울 수도 있습니다. 목록 캐시처럼 영향받는 키를 특정하기 어려우면 allEntries로 전체를 비웁니다.",
          followUps: [
            [
              "메서드에서 예외가 나면 캐시는 삭제되나요?",
              "기본값(beforeInvocation = false)에서는 정상 종료된 경우에만 삭제하므로 예외가 나면 삭제하지 않습니다. 예외와 상관없이 지워야 하면 beforeInvocation = true를 씁니다."
            ]
          ],
          related: ["spring/cacheput", "spring/kaesi-ilgwanseong", "spring/rediscachemanager"]
        },
        {
          id: "spring/cachemanager",
          slug: "cachemanager",
          title: "CacheManager",
          deep: false,
          def: "캐시 이름으로 `Cache` 객체를 찾아 주는 스프링 캐시 추상화의 핵심 인터페이스로, 구현체에 따라 실제 저장소가 정해진다.",
          why: "로컬 메모리, Caffeine, Redis 등 실제 캐시 저장소를 설정만으로 바꿔 끼울 수 있게 하기 위해서다.",
          how: [
            "- `ConcurrentMapCacheManager`: JVM 메모리의 Map. 부트 기본(simple)이며 TTL이 없어 테스트·개발용이다.",
            "- `CaffeineCacheManager`: 크기 제한과 만료를 지원하는 고성능 로컬 캐시.",
            "- `RedisCacheManager`: 여러 서버가 공유하는 원격 캐시.",
            "- `CompositeCacheManager`: 여러 매니저를 순서대로 조회한다.",
            "`spring.cache.type`으로 구현을 고르고, `spring.cache.cache-names`로 미리 만들 캐시 이름을 지정한다.",
            "캐시마다 TTL을 다르게 두려면 직접 CacheManager 빈이나 `RedisCacheManagerBuilderCustomizer`를 등록한다."
          ],
          use: [
            "`spring.cache.type=redis`로 운영 환경에서 Redis 캐시를 쓰고, 테스트에서는 `none`으로 캐시를 끈다.",
            "상품은 30분, 환율은 1분처럼 캐시 이름마다 TTL을 다르게 등록한다."
          ],
          answer: "CacheManager는 캐시 이름으로 Cache 객체를 돌려주는 인터페이스이고, 어떤 구현체를 쓰느냐로 저장소가 결정됩니다. 부트는 클래스패스를 보고 Caffeine, Redis 등을 자동 설정하고, 없으면 ConcurrentMapCacheManager를 씁니다. 캐시별 TTL이 필요하면 빌더 커스터마이저로 직접 설정합니다.",
          followUps: [
            [
              "로컬 캐시와 Redis 캐시를 함께 쓸 수 있나요?",
              "CacheManager 빈을 두 개 등록하고 @Cacheable의 cacheManager 속성으로 고르거나, CompositeCacheManager로 묶을 수 있습니다. 2단계 캐시처럼 로컬 먼저 보고 Redis를 보는 구조는 직접 Cache 구현을 만들어야 합니다."
            ]
          ],
          related: ["spring/caffeine-rokeol-kaesi", "spring/rediscachemanager", "spring/jadong-seoljeong-wonri"]
        },
        {
          id: "spring/kaesi-ki-seolgye",
          slug: "kaesi-ki-seolgye",
          title: "캐시 키 설계",
          deep: false,
          def: "캐시 이름과 키를 어떻게 구성해 충돌 없이 원하는 범위로 값을 저장할지 정하는 일이다.",
          why: "키를 잘못 잡으면 다른 메서드나 다른 사용자의 값이 서로 덮어써져 엉뚱한 데이터가 반환되기 때문이다.",
          how: [
            "기본 `SimpleKeyGenerator`는 인자만으로 키를 만든다. 인자가 없으면 `SimpleKey.EMPTY`, 하나면 그 값, 여러 개면 `SimpleKey(인자들)`이다.",
            "메서드 이름은 키에 들어가지 않는다. 같은 캐시 이름을 쓰는 두 메서드가 같은 인자를 받으면 서로의 값을 덮어쓴다. 캐시 이름을 메서드 용도별로 나눈다.",
            "- 결과에 영향을 주는 값(사용자, 언어, 페이지 번호)은 모두 키에 넣는다.",
            "- 키로 쓰는 객체는 `equals`/`hashCode`가 올바르게 구현되어야 한다(record 권장).",
            "- Redis에서는 `cacheName::key` 형태로 저장되므로 키의 `toString()` 결과가 사람이 읽을 수 있어야 운영이 쉽다.",
            "- 배포로 캐시 값 구조가 바뀌면 이전 형식과 섞이지 않게 키 접두사에 버전을 둔다."
          ],
          code: "@Cacheable(cacheNames = \"productPage\", key = \"#category + ':' + #page + ':' + #size\")\npublic List<ProductDto> findByCategory(String category, int page, int size) { ... }",
          codeLang: "java",
          use: [
            "페이지 조회 캐시 키에 카테고리, 페이지 번호, 크기를 모두 넣는다.",
            "응답 DTO 구조가 바뀌는 배포에서 캐시 이름을 `product:v2`로 바꿔 옛 데이터와 섞이지 않게 한다."
          ],
          myth: [
            [
              "기본 키에는 메서드 이름이 포함된다.",
              "SimpleKeyGenerator는 인자만 쓴다. 메서드를 구분하려면 캐시 이름을 나누거나 커스텀 KeyGenerator를 쓴다."
            ]
          ],
          answer: "기본 키 생성기는 메서드 인자만으로 키를 만들고 메서드 이름은 넣지 않습니다. 그래서 같은 캐시 이름을 여러 메서드가 공유하면 키가 충돌할 수 있어 캐시 이름을 용도별로 나눕니다. 결과에 영향을 주는 값은 모두 키에 넣고, 배포로 값 구조가 바뀌면 키 버전을 올립니다.",
          analogy: "도서관 청구 기호와 같습니다. 분류(캐시 이름)와 번호(키)가 겹치면 다른 책이 같은 자리에 꽂힙니다.",
          followUps: [
            [
              "파라미터가 객체일 때 키는 어떻게 만들어지나요?",
              "그 객체 자체가 키가 되므로 equals와 hashCode가 올바르게 구현되어야 합니다. Redis에서는 toString 결과가 키 문자열이 되기 때문에 record처럼 값 기반 객체를 쓰거나 key 속성으로 필요한 필드만 지정합니다."
            ]
          ],
          related: ["spring/cacheable", "spring/rediscachemanager"]
        }
      ]
    },
    {
      name: "캐시 저장소 · 운영",
      compare: {
        cols: ["기준", "Caffeine 로컬 캐시", "RedisCacheManager"],
        rows: [
          ["저장 위치", "각 서버의 JVM 힙", "별도 Redis 서버"],
          ["속도", "가장 빠름 (메모리 접근)", "네트워크 왕복 + 직렬화"],
          ["서버 간 공유", "안 됨, 서버마다 다른 값 가능", "모든 서버가 같은 값"],
          ["직렬화", "필요 없음 (객체 참조)", "필요 (JDK, JSON 등)"],
          ["장애 영향", "서버 재시작 시 비워짐", "Redis 장애 시 캐시 전체 불가"],
          ["적합한 데이터", "변경이 드문 코드·설정", "여러 서버가 공유하는 조회 결과, 세션"]
        ]
      },
      concepts: [
        {
          id: "spring/caffeine-rokeol-kaesi",
          slug: "caffeine-rokeol-kaesi",
          title: "Caffeine 로컬 캐시",
          deep: false,
          def: "애플리케이션 JVM 힙 안에 값을 저장하는 고성능 로컬 캐시 라이브러리로, `CaffeineCacheManager`로 스프링 캐시에 연결한다.",
          why: "네트워크 왕복과 직렬화 없이 가장 빠르게 조회하면서도 크기 제한과 만료로 메모리 고갈을 막기 위해서다.",
          how: [
            "`spring.cache.type=caffeine`, `spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=10m`처럼 크기와 만료를 지정한다.",
            "네트워크 왕복과 직렬화가 없어 가장 빠르다. 객체가 그대로 저장된다.",
            "서버마다 캐시가 따로라서 한 서버에서 삭제해도 다른 서버에는 이전 값이 남는다.",
            "- 적합: 코드성 데이터, 설정값, 변경이 드물고 조금 늦게 반영돼도 되는 데이터.",
            "- 부적합: 서버 간에 즉시 같아야 하는 데이터, 용량이 큰 데이터."
          ],
          use: [
            "공통 코드, 카테고리 트리, 기능 플래그처럼 거의 바뀌지 않는 데이터를 캐시한다.",
            "Redis 앞단에 짧은 TTL의 로컬 캐시를 두어 초당 수만 건의 핫 키 조회를 서버 안에서 처리한다."
          ],
          warn: ["캐시 크기를 정하지 않으면 힙을 계속 차지해 GC 부담과 OOM을 부른다. `maximumSize`를 반드시 둔다."],
          answer: "Caffeine은 JVM 힙에 값을 저장하는 고성능 로컬 캐시로, CaffeineCacheManager로 스프링 캐시에 연결합니다. 네트워크와 직렬화가 없어 가장 빠르지만 서버마다 캐시가 따로라 서버 간에 값이 달라질 수 있습니다. 그래서 변경이 드문 데이터에 크기 제한과 만료 시간을 두고 씁니다.",
          analogy: "각자 책상 서랍에 둔 메모입니다. 꺼내기는 빠르지만, 옆자리 서랍의 메모까지 고쳐 주지는 않습니다.",
          followUps: [
            [
              "서버가 여러 대일 때 로컬 캐시 값이 달라지는 문제는 어떻게 하나요?",
              "허용 가능한 지연이면 TTL을 짧게 두고, 즉시 맞춰야 하면 변경 시 Redis Pub/Sub이나 Kafka로 삭제 메시지를 보내 모든 서버가 해당 키를 지우게 합니다. 그것도 부담스러우면 Redis 같은 공유 캐시를 씁니다."
            ]
          ],
          related: ["spring/rediscachemanager", "spring/cachemanager", "spring/kaesi-ilgwanseong"]
        },
        {
          id: "spring/rediscachemanager",
          slug: "rediscachemanager",
          title: "RedisCacheManager",
          deep: false,
          def: "Redis를 저장소로 쓰는 CacheManager로, 여러 서버가 같은 캐시를 공유하게 한다.",
          why: "서버가 여러 대일 때 로컬 캐시는 서버마다 값이 달라지므로, 하나의 캐시를 공유해 일관성을 맞추기 위해서다.",
          how: [
            "`spring-boot-starter-data-redis`와 `spring.cache.type=redis`로 자동 설정되며 `spring.cache.redis.time-to-live`로 기본 TTL을 정한다.",
            "`RedisCacheConfiguration`으로 TTL, 키 접두사, 값 직렬화, null 저장 여부를 정한다. 캐시별 TTL은 `withCacheConfiguration`으로 따로 준다.",
            "기본 값 직렬화는 JDK 직렬화라 클래스가 `Serializable`이어야 하고 사람이 읽을 수 없다. JSON 직렬화로 바꾸는 경우가 많다.",
            "`transactionAware()`를 켜면 트랜잭션 안의 put/evict가 커밋 후에 반영된다."
          ],
          flow: ["프록시가 캐시 이름·키 계산", "cacheName::key로 Redis 조회", "값 역직렬화", "미스면 메서드 실행", "결과 직렬화", "TTL과 함께 SET"],
          code: "@Bean\nRedisCacheManagerBuilderCustomizer cacheCustomizer() {\n    RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()\n        .entryTtl(Duration.ofMinutes(10))\n        .disableCachingNullValues()\n        .serializeValuesWith(SerializationPair.fromSerializer(\n            new GenericJackson2JsonRedisSerializer()));\n    return builder -> builder\n        .cacheDefaults(base)\n        .withCacheConfiguration(\"product\", base.entryTtl(Duration.ofMinutes(30)));\n}",
          codeLang: "java",
          use: ["서버 여러 대가 같은 상품 캐시를 공유해 DB 조회를 서버 수와 무관하게 줄인다.", "`transactionAware()`로 트랜잭션 안의 캐시 삭제를 커밋 후로 미룬다."],
          warn: ["DTO 클래스의 패키지나 필드가 바뀌면 이전에 저장된 JSON을 역직렬화하지 못해 오류가 난다. 배포 시 키 버전을 올리거나 캐시를 비운다."],
          answer: "RedisCacheManager는 Redis를 저장소로 쓰는 CacheManager로, 여러 서버가 같은 캐시를 공유합니다. RedisCacheConfiguration으로 TTL, 키 접두사, 값 직렬화, null 저장 여부를 정하고 캐시별로 다른 TTL을 줄 수 있습니다. 기본이 JDK 직렬화라 보통 JSON 직렬화로 바꿔 씁니다.",
          followUps: [
            [
              "Redis가 장애 나면 캐시를 쓰는 API도 같이 실패하나요?",
              "기본으로는 캐시 조회 예외가 그대로 전파됩니다. CachingConfigurer에서 CacheErrorHandler를 등록해 캐시 오류를 로그만 남기고 무시하면 메서드가 실행되어 DB에서 응답합니다. 대신 DB 부하가 급증하므로 커넥션 타임아웃을 짧게 둡니다."
            ]
          ],
          related: ["spring/caffeine-rokeol-kaesi", "spring/redis-jikryeolhwa-seoljeong", "spring/cachemanager"]
        },
        {
          id: "spring/kaesi-ilgwanseong",
          slug: "kaesi-ilgwanseong",
          title: "캐시 일관성",
          deep: true,
          def: "원본 DB의 데이터와 캐시에 저장된 값이 어긋나지 않도록, 또는 어긋나는 시간을 허용 범위 안으로 줄이도록 관리하는 일이다.",
          why: "캐시는 원본의 복사본이라 갱신 순서, 트랜잭션 롤백, 여러 서버의 로컬 캐시 때문에 오래된 값을 보여 줄 수 있다. 어디까지 허용할지 정하지 않으면 장애와 데이터 불신으로 이어진다.",
          how: [
            "기본 패턴은 Cache-Aside다. 조회는 캐시 먼저(`@Cacheable`), 쓰기는 DB를 갱신한 뒤 캐시를 삭제(`@CacheEvict`)한다.",
            "1) 쓰기 요청이 트랜잭션 안에서 DB를 수정한다.",
            "2) 트랜잭션이 커밋된 뒤 캐시를 삭제한다. 커밋 전에 지우면 그 사이 조회가 옛 값을 다시 캐시에 넣는다.",
            "3) 다음 조회가 캐시 미스를 내고 DB의 최신 값을 읽어 다시 캐시한다.",
            "4) 모든 키에 TTL을 두어, 삭제가 누락되더라도 일정 시간 뒤 스스로 맞춰지게 한다.",
            "- 커밋 후 삭제: `RedisCacheManager`의 `transactionAware()`, `TransactionAwareCacheManagerProxy`, 또는 `@TransactionalEventListener(AFTER_COMMIT)`에서 삭제한다.",
            "- 갱신보다 삭제: 동시 갱신 시 순서가 뒤바뀌어 옛 값으로 덮어쓰는 문제를 줄인다.",
            "- 로컬 캐시 다중 서버: Redis Pub/Sub이나 Kafka로 삭제 이벤트를 모든 서버에 전파하거나, TTL을 짧게 둔다."
          ],
          flow: ["DB 수정", "트랜잭션 커밋", "캐시 키 삭제", "다음 조회에서 미스", "DB 최신 값 조회", "캐시 재적재"],
          code: "@Configuration\n@EnableCaching\npublic class CacheConfig {\n    @Bean\n    RedisCacheManager cacheManager(RedisConnectionFactory cf) {\n        return RedisCacheManager.builder(cf)\n            .cacheDefaults(RedisCacheConfiguration.defaultCacheConfig()\n                .entryTtl(Duration.ofMinutes(10)))\n            .transactionAware() // 트랜잭션 안의 evict를 커밋 후에 실행\n            .build();\n    }\n}",
          codeLang: "java",
          use: [
            "상품 수정 트랜잭션 커밋 후 `@TransactionalEventListener`에서 상품 캐시를 삭제한다.",
            "다중 서버 로컬 캐시는 Redis Pub/Sub으로 삭제 이벤트를 전파하고 TTL을 5분 이하로 둔다."
          ],
          warn: [
            "`@CacheEvict`와 `@Transactional`을 같은 메서드에 붙여도 프록시 순서에 따라 커밋 전에 삭제될 수 있다. transactionAware나 커밋 후 이벤트로 순서를 보장한다.",
            "정확성이 꼭 필요한 값(재고, 잔액, 결제 상태)은 캐시 값을 근거로 쓰기 판단을 하지 않는다. 쓰기는 항상 DB 기준으로 검증한다."
          ],
          myth: [["캐시를 쓰면서 DB와 항상 완전히 같게 유지할 수 있다.", "분산 환경에서는 짧은 불일치를 완전히 없애기 어렵다. 허용 범위를 정하고 TTL과 커밋 후 삭제로 줄인다."]],
          answer: "캐시는 원본의 복사본이라 DB와 어긋날 수 있어서, 기본으로 Cache-Aside 패턴을 씁니다. 조회는 캐시 먼저 보고 없으면 DB에서 읽어 채우고, 쓰기는 DB를 커밋한 뒤 캐시를 삭제합니다. 삭제가 누락되거나 순서가 꼬이는 경우를 대비해 모든 키에 TTL을 두어 결국 맞춰지게 합니다.",
          analogy: "가게 앞 가격표와 같습니다. 가격을 바꾸면 장부를 먼저 고친 뒤 가격표를 떼어 내고, 다음 손님이 올 때 장부를 보고 새로 붙입니다.",
          qa: [
            "DB를 수정할 때 캐시는 갱신하나요, 삭제하나요?",
            "보통 DB를 커밋한 뒤 캐시를 삭제합니다. 갱신은 동시 요청에서 순서가 뒤바뀌면 옛 값이 남을 수 있고, 계산 비용도 쓰기 쪽에 몰립니다. 삭제하면 다음 조회가 최신 값을 다시 채우고, 삭제가 누락되는 경우에 대비해 모든 캐시에 TTL을 둡니다."
          ],
          followUps: [
            [
              "커밋 전에 캐시를 삭제하면 왜 문제인가요?",
              "삭제와 커밋 사이에 다른 요청이 조회하면 아직 커밋되지 않은 옛 값을 DB에서 읽어 다시 캐시에 넣습니다. 그러면 커밋 후에도 캐시에는 옛 값이 TTL 동안 남습니다."
            ],
            [
              "캐시 삭제가 실패하면 어떻게 되나요?",
              "TTL이 지날 때까지 옛 값이 보입니다. 그래서 TTL을 안전망으로 두고, 중요한 데이터는 삭제 실패를 재시도하거나 이벤트로 다시 처리합니다."
            ]
          ],
          related: [
            "spring/cacheevict",
            "spring/cacheput",
            "spring/rediscachemanager",
            "spring/caffeine-rokeol-kaesi",
            "spring/teuraenjaeksyeon-ibenteu-riseuneo"
          ]
        },
        {
          id: "spring/kaesi-seutaempideu",
          slug: "kaesi-seutaempideu",
          title: "캐시 스탬피드",
          deep: false,
          def: "인기 키가 만료되는 순간 많은 요청이 동시에 캐시 미스를 내고 한꺼번에 DB로 몰리는 현상이다.",
          why: "인기 키가 만료되는 순간 동시 요청이 한꺼번에 DB로 몰려 DB가 과부하로 쓰러지는 것을 막기 위해서다.",
          how: [
            "`@Cacheable(sync = true)`로 같은 키에 대해 한 스레드만 메서드를 실행하고 나머지는 결과를 기다리게 한다.",
            "`sync`는 한 JVM 안에서만 보장된다. 서버가 여러 대면 서버 수만큼은 DB를 조회한다.",
            "- TTL에 무작위 값을 더해 많은 키가 동시에 만료되지 않게 한다.",
            "- 아주 뜨거운 키는 만료 전에 스케줄러로 미리 갱신한다.",
            "- 여러 서버에서도 한 번만 계산해야 하면 Redis 분산 락을 쓴다."
          ],
          use: [
            "메인 페이지 랭킹 캐시에 `sync = true`를 붙여 만료 순간의 DB 폭주를 막는다.",
            "대량으로 같은 시간에 적재한 캐시의 TTL에 0~60초 무작위 값을 더해 만료를 분산한다."
          ],
          warn: ["`sync = true`는 `unless`와 함께 쓸 수 없고, 다른 캐시 애너테이션과 조합할 수 없다."],
          answer: "캐시 스탬피드는 인기 키가 만료되는 순간 많은 요청이 동시에 DB로 몰리는 현상입니다. 스프링에서는 @Cacheable(sync = true)로 한 JVM 안에서는 한 스레드만 DB를 조회하게 할 수 있습니다. 서버가 여러 대면 TTL에 무작위 값을 더하거나 미리 갱신, 분산 락을 함께 씁니다.",
          analogy: "가게 문이 열리는 순간 줄 선 손님이 한꺼번에 몰려드는 것과 같습니다. 한 명만 들여보내 물건을 꺼내 오게 하고 나머지는 기다리게 합니다.",
          followUps: [
            [
              "sync = true면 여러 서버에서도 한 번만 조회하나요?",
              "아닙니다. 한 JVM 안의 스레드끼리만 막아 주므로 서버 수만큼은 조회가 일어납니다. 전체에서 한 번만 계산해야 하면 Redis 분산 락이나 미리 갱신 방식을 씁니다."
            ]
          ],
          related: ["spring/cacheable", "spring/bunsan-seukejul-rak"]
        }
      ]
    },
    {
      name: "Spring Data Redis",
      compare: {
        cols: ["기준", "RedisTemplate", "StringRedisTemplate"],
        rows: [
          ["제네릭 타입", "<K, V> 자유", "<String, String> 고정"],
          ["기본 직렬화", "JDK 직렬화", "StringRedisSerializer"],
          ["redis-cli 가독성", "설정 안 하면 깨져 보임", "그대로 읽힘"],
          ["객체 저장", "직렬화기 설정 후 바로 저장", "ObjectMapper로 JSON 변환 후 저장"],
          ["주로 쓰는 곳", "다양한 타입 객체 저장", "카운터, 토큰, 락 키"]
        ]
      },
      concepts: [
        {
          id: "spring/redistemplate",
          slug: "redistemplate",
          title: "RedisTemplate",
          deep: false,
          def: "Spring Data Redis가 제공하는 Redis 명령 실행 템플릿으로, 자바 객체를 직렬화해 문자열·해시·리스트·셋·정렬 셋 자료구조에 저장한다.",
          why: "Redis 명령과 직렬화를 직접 다루지 않고 자바 객체로 다양한 Redis 자료구조를 편하게 쓰기 위해서다.",
          how: [
            "- `opsForValue()`: 문자열(GET/SET). 캐시, 카운터, 토큰 저장.",
            "- `opsForHash()`: 해시. 객체 필드 단위 저장.",
            "- `opsForList()`, `opsForSet()`, `opsForZSet()`: 큐, 중복 제거, 랭킹.",
            "키와 값은 설정한 `RedisSerializer`로 바이트 배열로 바뀐다. 기본은 JDK 직렬화라 대부분 직접 설정한다.",
            "여러 명령을 한 번에 보내려면 `executePipelined()`, 원자적으로 묶으려면 Lua 스크립트(`execute(RedisScript, ...)`)를 쓴다.",
            "`@Cacheable`로 표현하기 어려운 자료구조, 원자적 증가(`increment`), 만료 시간 제어가 필요할 때 직접 쓴다."
          ],
          code: "@Bean\nRedisTemplate<String, Object> redisTemplate(RedisConnectionFactory cf) {\n    RedisTemplate<String, Object> template = new RedisTemplate<>();\n    template.setConnectionFactory(cf);\n    template.setKeySerializer(new StringRedisSerializer());\n    template.setValueSerializer(new GenericJackson2JsonRedisSerializer());\n    template.setHashKeySerializer(new StringRedisSerializer());\n    template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());\n    return template;\n}\n\n// 사용\nredisTemplate.opsForValue().set(\"session:\" + id, dto, Duration.ofMinutes(30));\nLong views = redisTemplate.opsForValue().increment(\"views:\" + postId);",
          codeLang: "java",
          use: [
            "`increment()`로 게시글 조회수를 원자적으로 올리고 주기적으로 DB에 반영한다.",
            "`opsForZSet()`으로 실시간 인기 상품 랭킹을 관리한다.",
            "로그인 토큰을 TTL과 함께 저장해 만료를 Redis에 맡긴다."
          ],
          warn: [
            "`multi()`/`exec()` 트랜잭션은 같은 커넥션에서 실행되어야 하므로 `SessionCallback` 안에서 쓴다. 그냥 연달아 호출하면 다른 커넥션으로 나가 동작하지 않는다."
          ],
          answer: "RedisTemplate은 Redis 명령을 자바 객체로 다루게 해 주는 템플릿으로, opsForValue, opsForHash, opsForZSet 같은 자료구조별 API를 제공합니다. 키와 값을 바이트로 바꾸는 직렬화기를 설정해야 하는데, 기본이 JDK 직렬화라 보통 키는 String, 값은 JSON 직렬화로 바꿉니다. @Cacheable로 표현하기 어려운 카운터, 랭킹, 만료 제어에 직접 씁니다.",
          followUps: [
            [
              "여러 Redis 명령을 원자적으로 실행하려면 어떻게 하나요?",
              "Lua 스크립트를 RedisScript로 만들어 execute로 실행하는 것이 가장 확실합니다. MULTI/EXEC는 같은 커넥션이 필요해 SessionCallback 안에서 써야 하고, 중간 결과로 분기할 수 없다는 한계가 있습니다."
            ]
          ],
          related: ["spring/stringredistemplate", "spring/redis-jikryeolhwa-seoljeong", "spring/lettuce-keoneksyeon"]
        },
        {
          id: "spring/stringredistemplate",
          slug: "stringredistemplate",
          title: "StringRedisTemplate",
          deep: false,
          def: "키, 값, 해시 키, 해시 값을 모두 `StringRedisSerializer`로 다루는 `RedisTemplate<String, String>` 전용 클래스다.",
          why: "JDK 직렬화로 키와 값이 깨져 보이는 문제 없이 redis-cli와 다른 언어 서비스에서도 그대로 읽게 하기 위해서다.",
          how: [
            "부트가 `redisTemplate`(JDK 직렬화)과 함께 자동으로 등록한다.",
            "redis-cli에서 보이는 값과 코드에서 다루는 값이 같아 운영 중 확인이 쉽고, 다른 언어 서비스와도 그대로 공유된다.",
            "객체를 저장할 때는 `ObjectMapper`로 직접 JSON 문자열로 바꿔 넣는다. 타입 정보가 섞이지 않아 깔끔하다.",
            "카운터, 토큰, 분산 락 키처럼 값이 단순 문자열·숫자인 경우에 가장 많이 쓴다."
          ],
          use: ["분산 락 키를 `SET key value NX PX` 형태(`setIfAbsent`)로 잡는다.", "API 호출 횟수 제한 카운터를 문자열 숫자로 저장하고 증가시킨다."],
          answer: "StringRedisTemplate은 키와 값을 모두 문자열로 직렬화하는 RedisTemplate입니다. redis-cli에서 보이는 값과 코드의 값이 같아서 운영 중 확인이 쉽고 다른 언어 서비스와도 그대로 공유됩니다. 객체는 ObjectMapper로 직접 JSON 문자열로 바꿔 저장합니다.",
          followUps: [
            [
              "RedisTemplate<String, String>을 직접 만드는 것과 차이가 있나요?",
              "기능적으로는 직렬화기를 모두 StringRedisSerializer로 설정한 RedisTemplate과 같습니다. 부트가 자동으로 등록해 주므로 설정 없이 바로 주입받아 쓸 수 있다는 점이 편리합니다."
            ]
          ],
          related: ["spring/redistemplate", "spring/redis-jikryeolhwa-seoljeong"]
        },
        {
          id: "spring/redis-jikryeolhwa-seoljeong",
          slug: "redis-jikryeolhwa-seoljeong",
          title: "Redis 직렬화 설정",
          deep: false,
          def: "`RedisTemplate`과 `RedisCacheManager`가 자바 객체를 Redis 바이트로 바꾸는 `RedisSerializer`를 고르는 설정이다.",
          why: "기본 JDK 직렬화는 키가 깨져 보이고 클래스가 바뀌면 역직렬화가 실패해 장애로 이어지기 때문이다.",
          how: [
            "- `JdkSerializationRedisSerializer`: 기본값. `Serializable` 필수, 키가 `\\xac\\xed...`처럼 깨져 보이고 클래스가 바뀌면 역직렬화가 실패한다.",
            "- `StringRedisSerializer`: 문자열 그대로. 키에는 사실상 항상 이것을 쓴다.",
            "- `GenericJackson2JsonRedisSerializer`: JSON에 `@class` 타입 정보를 함께 저장해 어떤 타입이든 복원한다. 대신 클래스 이름이 데이터에 묶인다.",
            "- `Jackson2JsonRedisSerializer<T>`: 타입을 하나로 고정해 타입 정보 없이 저장한다. 캐시마다 타입이 정해진 경우에 적합하다.",
            "`LocalDateTime` 같은 Java 8 날짜 타입은 `JavaTimeModule`을 등록한 ObjectMapper를 넘겨야 직렬화된다.",
            "Spring Data Redis 4.0(부트 4)에서는 Jackson 3 기반 `GenericJacksonJsonRedisSerializer`가 추가되고 Jackson2 계열은 deprecated되었다."
          ],
          use: [
            "캐시 값을 JSON으로 저장해 redis-cli와 모니터링 도구에서 내용을 바로 확인한다.",
            "ObjectMapper에 JavaTimeModule을 등록해 LocalDateTime 필드를 직렬화한다."
          ],
          warn: ["`GenericJackson2JsonRedisSerializer`로 저장한 뒤 DTO의 패키지를 옮기면 `@class` 값이 맞지 않아 기존 캐시를 읽지 못한다."],
          myth: [
            [
              "JSON 직렬화로 바꾸면 클래스가 바뀌어도 항상 안전하다.",
              "Generic 방식은 @class에 클래스 이름이 저장되어 패키지 이동이나 클래스 이름 변경에 여전히 깨진다."
            ]
          ],
          answer: "RedisTemplate과 RedisCacheManager는 RedisSerializer로 객체를 바이트로 바꾸는데, 기본값인 JDK 직렬화는 사람이 읽을 수 없고 클래스 변경에 약합니다. 그래서 키는 StringRedisSerializer, 값은 Jackson 기반 JSON 직렬화기를 주로 씁니다. 타입 정보를 함께 넣는 Generic 방식과 타입을 고정하는 방식의 장단점을 알고 고릅니다.",
          analogy: "택배 포장 방식과 같습니다. 같은 회사끼리만 열 수 있는 전용 포장(JDK)보다, 누구나 열어 볼 수 있는 투명 포장(JSON)이 관리하기 쉽습니다.",
          followUps: [
            [
              "GenericJackson2JsonRedisSerializer와 Jackson2JsonRedisSerializer의 차이는?",
              "Generic은 값마다 @class 타입 정보를 넣어 어떤 타입이든 복원하지만 데이터가 클래스 이름에 묶입니다. Jackson2JsonRedisSerializer는 생성할 때 타입을 하나로 정해 타입 정보 없이 깔끔하게 저장하지만 그 타입만 다룰 수 있습니다."
            ]
          ],
          related: ["spring/redistemplate", "spring/rediscachemanager", "spring/httpmessageconverter"]
        },
        {
          id: "spring/lettuce-keoneksyeon",
          slug: "lettuce-keoneksyeon",
          title: "Lettuce 커넥션",
          deep: false,
          def: "스프링 부트의 기본 Redis 클라이언트로, Netty 기반 논블로킹 방식이라 하나의 커넥션을 여러 스레드가 안전하게 공유한다.",
          why: "스레드마다 커넥션을 따로 잡지 않고 하나의 논블로킹 커넥션을 공유해 적은 자원으로 Redis를 호출하기 위해서다.",
          how: [
            "`spring.data.redis.host`, `port`, `timeout`으로 연결하고 `LettuceConnectionFactory`가 자동 등록된다.",
            "기본은 커넥션 하나를 공유한다. 명령이 파이프라인처럼 다중화되므로 일반 명령에는 풀이 필요 없다.",
            "`BLPOP` 같은 블로킹 명령이나 `MULTI` 트랜잭션은 전용 커넥션이 필요해 `commons-pool2`와 `spring.data.redis.lettuce.pool.enabled=true`로 풀을 쓴다.",
            "클러스터·센티널은 `spring.data.redis.cluster.nodes`, `sentinel.master` 설정으로 지원한다.",
            "Jedis도 쓸 수 있지만 커넥션이 스레드 안전하지 않아 반드시 풀을 써야 한다."
          ],
          use: [
            "`spring.data.redis.timeout=200ms`로 Redis 지연이 요청 스레드를 오래 묶지 않게 한다.",
            "운영에서 Redis Cluster 노드 목록을 설정해 샤딩된 Redis에 연결한다."
          ],
          warn: [
            "`spring.data.redis.timeout`(명령 타임아웃)을 정하지 않으면 Redis 장애 시 요청 스레드가 오래 묶인다. 짧게 잡고 캐시 실패 시 DB로 넘어가게 한다."
          ],
          myth: [["Redis도 DB처럼 커넥션 풀을 크게 잡아야 성능이 난다.", "Lettuce는 하나의 커넥션으로 명령을 다중화하므로 일반 명령에는 풀이 성능을 크게 올리지 않는다."]],
          answer: "Lettuce는 스프링 부트의 기본 Redis 클라이언트로 Netty 기반이라 하나의 커넥션을 여러 스레드가 안전하게 공유합니다. 그래서 일반 명령에는 커넥션 풀이 필요 없고, 블로킹 명령이나 MULTI 트랜잭션처럼 전용 커넥션이 필요할 때만 풀을 켭니다. Redis 장애에 대비해 명령 타임아웃을 짧게 잡는 것이 중요합니다.",
          followUps: [
            [
              "Lettuce와 Jedis는 어떻게 다른가요?",
              "Lettuce는 Netty 기반 논블로킹이라 커넥션이 스레드 안전하고 리액티브 API도 지원해 부트의 기본입니다. Jedis는 블로킹 방식이고 커넥션이 스레드 안전하지 않아 반드시 풀에서 꺼내 써야 합니다."
            ]
          ],
          related: ["spring/redistemplate", "spring/oebu-hochul-taimaut"]
        }
      ]
    },
    {
      name: "Spring Kafka 기본",
      compare: {
        cols: ["개념", "역할", "핵심 설정·API", "주의점"],
        rows: [
          ["KafkaTemplate", "메시지 발행", "`send()` → `CompletableFuture`", "결과 미확인 시 실패 놓침"],
          [
            "@KafkaListener",
            "메시지 소비 메서드 지정",
            "`topics`, `groupId`, `concurrency`",
            "예외 시 `DefaultErrorHandler` 재시도"
          ],
          ["Kafka 컨슈머 그룹", "파티션 분배·병렬 소비", "`groupId`", "컨슈머 > 파티션이면 유휴 발생"],
          ["Kafka AckMode", "오프셋 커밋 시점 결정", "`BATCH`(기본), `RECORD`, `MANUAL`", "커밋 전 장애 시 중복 소비"]
        ]
      },
      concepts: [
        {
          id: "spring/kafkatemplate",
          slug: "kafkatemplate",
          title: "KafkaTemplate",
          deep: false,
          def: "Spring Kafka가 제공하는 프로듀서 템플릿으로, 토픽에 메시지를 보내고 전송 결과를 비동기로 돌려준다.",
          why: "프로듀서 생성, 직렬화, 전송 결과 처리를 직접 구현하지 않고 간단하게 Kafka로 메시지를 보내기 위해서다.",
          how: [
            "`spring.kafka.bootstrap-servers`, `producer.key-serializer`, `value-serializer`만 설정하면 부트가 `KafkaTemplate`을 자동 등록한다.",
            "`send(topic, key, value)`는 Spring Kafka 3.0부터 `CompletableFuture<SendResult>`를 반환한다(2.x의 `ListenableFuture`는 제거).",
            "같은 키는 같은 파티션으로 가므로, 순서가 중요한 메시지(같은 주문의 이벤트)는 주문 ID를 키로 준다.",
            "전송은 배치로 모아 보내므로 `send()`가 반환되어도 브로커에 도착한 것은 아니다. 결과 콜백이나 `get()`으로 확인한다."
          ],
          code: "public void publish(OrderCreated event) {\n    kafkaTemplate.send(\"order-created\", event.orderId().toString(), event)\n        .whenComplete((result, ex) -> {\n            if (ex != null) {\n                log.error(\"전송 실패 orderId={}\", event.orderId(), ex);\n                return;\n            }\n            log.info(\"전송 완료 offset={}\", result.getRecordMetadata().offset());\n        });\n}",
          codeLang: "java",
          use: ["주문 완료 이벤트를 주문 ID를 키로 발행해 같은 주문의 이벤트 순서를 보장한다.", "전송 실패 콜백에서 실패 이벤트를 DB에 저장해 스케줄러로 재전송한다."],
          warn: ["JSON 직렬화(`JsonSerializer`)는 기본으로 타입 헤더를 넣는다. 소비 측 패키지가 다르면 역직렬화가 실패하므로 타입 매핑이나 신뢰 패키지를 설정한다."],
          answer: "KafkaTemplate은 Spring Kafka의 프로듀서 템플릿으로, send에 토픽, 키, 값을 넘기면 CompletableFuture로 전송 결과를 돌려줍니다. 같은 키는 같은 파티션으로 가므로 순서가 필요한 이벤트는 주문 ID 같은 엔터티 ID를 키로 줍니다. 전송은 비동기라 결과 콜백으로 실패를 로그하거나 재처리합니다.",
          analogy: "우체국 창구와 같습니다. 접수하면 바로 영수증 번호를 주지만, 실제 배달 결과는 나중에 알림으로 받습니다.",
          followUps: [
            [
              "@Transactional 메서드 안에서 KafkaTemplate으로 보내면 어떤 문제가 있나요?",
              "DB 트랜잭션이 롤백되어도 이미 보낸 메시지는 취소되지 않고, 반대로 전송 후 커밋 전에 소비자가 아직 없는 데이터를 조회할 수도 있습니다. 그래서 커밋 후 이벤트에서 보내거나, 아웃박스 테이블에 저장해 커밋과 함께 기록한 뒤 별도로 발행합니다."
            ]
          ],
          related: ["spring/kafkalistener", "spring/kafka-myeokdeung-peurodyuseo", "spring/kafka-teuraenjaeksyeon"]
        },
        {
          id: "spring/kafkalistener",
          slug: "kafkalistener",
          title: "@KafkaListener",
          deep: true,
          def: "메서드에 붙여 지정한 토픽의 메시지를 소비하게 하는 애너테이션으로, 내부적으로 메시지 리스너 컨테이너가 poll 루프와 오프셋 커밋을 관리한다.",
          why: "KafkaConsumer는 스레드 안전하지 않고 poll 루프, 커밋, 리밸런스, 에러 처리를 직접 구현해야 한다. 이를 컨테이너에 맡기고 개발자는 메시지 처리 로직만 쓰기 위해서다.",
          how: [
            "1) 기동 시 `@KafkaListener`를 찾아 `ConcurrentKafkaListenerContainerFactory`로 리스너 컨테이너를 만든다.",
            "2) 컨테이너는 `concurrency` 수만큼 컨슈머 스레드를 띄우고 각 스레드가 `poll()`로 레코드를 가져온다.",
            "3) 레코드를 역직렬화해 메서드 파라미터(`ConsumerRecord`, 페이로드, `@Header`, `Acknowledgment`)로 넘겨 호출한다.",
            "4) 정상 처리되면 AckMode에 따라 오프셋을 커밋하고, 예외가 나면 에러 핸들러가 재시도·DLT를 처리한다.",
            "- `groupId`: 컨슈머 그룹. 같은 그룹이면 파티션을 나눠 받는다.",
            "- `concurrency`: 컨슈머 스레드 수. 파티션 수보다 크면 남는 스레드는 논다.",
            "- `batch = \"true\"`: 레코드를 `List`로 한 번에 받는다."
          ],
          flow: ["컨테이너 팩토리가 컨테이너 생성", "컨슈머 스레드 poll()", "레코드 역직렬화", "리스너 메서드 호출", "AckMode에 따라 오프셋 커밋", "예외 시 에러 핸들러"],
          code: "@Component\n@RequiredArgsConstructor\npublic class OrderEventConsumer {\n    private final PointService pointService;\n\n    @KafkaListener(topics = \"order-created\", groupId = \"point-service\", concurrency = \"3\")\n    public void onOrderCreated(OrderCreated event,\n                               @Header(KafkaHeaders.RECEIVED_PARTITION) int partition) {\n        // 같은 메시지가 다시 올 수 있으므로 멱등하게 처리한다\n        if (pointService.alreadyProcessed(event.eventId())) return;\n        pointService.earn(event.userId(), event.amount(), event.eventId());\n    }\n}",
          codeLang: "java",
          use: [
            "주문 생성 이벤트를 포인트 서비스와 알림 서비스가 서로 다른 groupId로 각각 소비한다.",
            "대량 로그 토픽을 `batch = \"true\"`로 받아 DB에 일괄 저장한다."
          ],
          warn: [
            "Kafka는 기본적으로 at-least-once라 같은 메시지가 두 번 올 수 있다. 처리 이력 테이블이나 유니크 키로 멱등하게 만든다.",
            "처리가 `max.poll.interval.ms`(기본 5분)보다 오래 걸리면 컨슈머가 그룹에서 빠지고 리밸런스가 일어나 중복 소비가 생긴다."
          ],
          myth: [["concurrency를 높이면 처리량이 계속 늘어난다.", "파티션 하나는 그룹 내 한 컨슈머만 읽으므로 전체 컨슈머 수가 파티션 수를 넘으면 남는 스레드는 논다."]],
          answer: "@KafkaListener는 메서드에 붙여 토픽의 메시지를 소비하게 하는 애너테이션으로, 리스너 컨테이너가 poll 루프, 역직렬화, 오프셋 커밋, 에러 처리를 대신합니다. groupId로 컨슈머 그룹을, concurrency로 컨슈머 스레드 수를 정합니다. 오프셋은 처리 후 커밋되어 중복이 생길 수 있으므로 리스너는 멱등하게 작성합니다.",
          analogy: "우편함을 정기적으로 확인해 편지를 꺼내 주는 비서와 같습니다. 개발자는 편지 내용을 처리하는 일만 하고, 어디까지 읽었는지 기록은 비서가 합니다.",
          qa: [
            "@KafkaListener에서 같은 메시지가 중복으로 처리될 수 있는 이유와 대책은?",
            "오프셋은 처리 후에 커밋되는데, 처리 직후 커밋 전에 장애나 리밸런스가 나면 다음 컨슈머가 같은 오프셋부터 다시 읽습니다. 그래서 Kafka 소비는 최소 한 번 전달을 전제로 하고, 이벤트 ID를 처리 이력에 저장하거나 유니크 제약을 걸어 같은 메시지를 두 번 처리해도 결과가 같게 만듭니다."
          ],
          followUps: [
            [
              "리스너 처리 시간이 길면 어떤 문제가 생기나요?",
              "poll 사이 간격이 max.poll.interval.ms를 넘으면 컨슈머가 죽은 것으로 보고 리밸런스가 일어나 커밋 전 메시지가 다른 컨슈머에게 다시 갑니다. max.poll.records를 줄이거나 처리를 빠르게 하고, 정말 긴 작업은 별도 작업 큐로 넘깁니다."
            ],
            [
              "메시지 순서는 어떻게 보장하나요?",
              "Kafka는 파티션 안에서만 순서를 보장합니다. 순서가 중요한 메시지는 같은 키로 보내 같은 파티션에 넣고, 그 파티션은 한 컨슈머 스레드가 순서대로 처리합니다."
            ]
          ],
          related: [
            "spring/kafka-keonsyumeo-geurup",
            "spring/kafka-ackmode",
            "spring/kafka-ereo-haendeulreo",
            "spring/kafkatemplate"
          ]
        },
        {
          id: "spring/kafka-keonsyumeo-geurup",
          slug: "kafka-keonsyumeo-geurup",
          title: "Kafka 컨슈머 그룹",
          deep: false,
          def: "같은 `groupId`를 가진 컨슈머들이 토픽의 파티션을 나눠 맡아 병렬로 소비하는 단위다.",
          why: "파티션을 여러 컨슈머가 나눠 병렬로 처리하면서, 다른 서비스는 같은 메시지를 독립적으로 소비하게 하기 위해서다.",
          how: [
            "파티션 하나는 그룹 안에서 한 컨슈머에게만 할당된다. 그래서 그룹 내 최대 병렬도는 파티션 수다.",
            "서로 다른 그룹은 같은 메시지를 각자 모두 받는다. 포인트 서비스와 알림 서비스가 같은 주문 이벤트를 각각 처리할 수 있다.",
            "서버가 늘거나 줄면 리밸런스로 파티션을 다시 나눈다. `partition.assignment.strategy`를 `CooperativeStickyAssignor`로 두면 전체 소비를 멈추지 않고 필요한 파티션만 옮기는 협력적 리밸런싱이 된다.",
            "`auto-offset-reset`은 커밋된 오프셋이 없을 때 시작 위치를 정한다(`latest` 기본, `earliest`)."
          ],
          use: ["한 이벤트를 정산, 알림, 검색 색인 서비스가 서로 다른 그룹으로 독립적으로 소비한다.", "트래픽이 늘면 파티션 수에 맞춰 컨슈머 인스턴스를 늘린다."],
          warn: ["인스턴스 3대 × `concurrency` 3이면 컨슈머가 9개다. 파티션이 6개면 3개는 놀기 때문에 파티션 수에 맞춰 조정한다."],
          answer: "컨슈머 그룹은 같은 groupId를 가진 컨슈머들이 파티션을 나눠 소비하는 단위입니다. 그룹 안에서는 파티션 하나를 한 컨슈머만 읽어 병렬도의 상한이 파티션 수가 되고, 다른 그룹은 같은 메시지를 각자 모두 받습니다. 인스턴스가 늘거나 줄면 리밸런스로 파티션이 다시 배정됩니다.",
          analogy: "같은 팀원끼리는 우편물 더미를 나눠 처리하고, 다른 팀은 같은 우편물 복사본을 따로 받는 구조입니다.",
          followUps: [
            [
              "처음 뜬 컨슈머 그룹은 어디서부터 읽나요?",
              "커밋된 오프셋이 없으면 auto.offset.reset을 따릅니다. 기본 latest는 이후 새 메시지부터, earliest는 남아 있는 가장 오래된 메시지부터 읽습니다."
            ]
          ],
          related: ["spring/kafkalistener", "spring/kafka-ackmode"]
        },
        {
          id: "spring/kafka-ackmode",
          slug: "kafka-ackmode",
          title: "Kafka AckMode",
          deep: false,
          def: "리스너 컨테이너가 처리한 레코드의 오프셋을 언제 커밋할지 정하는 Spring Kafka 설정이다.",
          why: "오프셋 커밋 시점에 따라 장애 시 메시지 유실이나 중복 처리가 결정되므로 이를 의도대로 제어하기 위해서다.",
          how: [
            "Spring Kafka는 기본으로 컨슈머의 `enable.auto.commit`을 끄고 컨테이너가 직접 커밋한다.",
            "- `BATCH`(기본): poll로 받은 레코드를 모두 처리한 뒤 한 번에 커밋.",
            "- `RECORD`: 레코드 하나 처리할 때마다 커밋. 중복이 적지만 커밋이 잦다.",
            "- `MANUAL`: 리스너가 `Acknowledgment.acknowledge()`를 호출한 것을 모아 다음 poll 전에 커밋.",
            "- `MANUAL_IMMEDIATE`: `acknowledge()` 호출 즉시 커밋.",
            "- `TIME`, `COUNT`, `COUNT_TIME`: 시간·개수 기준으로 모아서 커밋.",
            "`spring.kafka.listener.ack-mode`로 지정한다."
          ],
          code: "// spring.kafka.listener.ack-mode=manual\n@KafkaListener(topics = \"payment\", groupId = \"settlement\")\npublic void listen(PaymentEvent event, Acknowledgment ack) {\n    settlementService.settle(event);\n    ack.acknowledge(); // 처리 완료 후에만 커밋\n}",
          codeLang: "java",
          use: ["결제 정산 리스너를 MANUAL로 두고 정산이 끝난 뒤에만 acknowledge를 호출한다.", "처리량이 중요한 로그 수집은 기본 BATCH로 커밋 횟수를 줄인다."],
          warn: [
            "수동 커밋에서 `acknowledge()`를 빠뜨리면 재시작 시 같은 메시지를 다시 받는다. 처리 실패 시에는 `acknowledge()` 대신 예외를 던져 에러 핸들러에 맡긴다."
          ],
          myth: [
            [
              "Kafka 컨슈머는 enable.auto.commit=true로 동작한다.",
              "Spring Kafka 리스너 컨테이너는 기본으로 자동 커밋을 끄고 AckMode에 따라 직접 커밋한다."
            ]
          ],
          answer: "AckMode는 리스너 컨테이너가 오프셋을 언제 커밋할지 정하는 설정입니다. Spring Kafka는 자동 커밋을 끄고 컨테이너가 커밋하며, 기본 BATCH는 poll로 받은 레코드를 모두 처리한 뒤 커밋합니다. 처리 완료를 직접 표시해야 하면 MANUAL이나 MANUAL_IMMEDIATE로 두고 Acknowledgment를 호출합니다.",
          followUps: [
            [
              "RECORD와 BATCH 중 무엇이 중복을 줄이나요?",
              "RECORD는 레코드마다 커밋해 장애 시 다시 받는 범위가 최대 한 건이고, BATCH는 한 poll 묶음 전체가 될 수 있습니다. 대신 RECORD는 커밋 요청이 많아 처리량이 떨어지므로, 보통 BATCH와 멱등 처리를 함께 씁니다."
            ]
          ],
          related: ["spring/kafkalistener", "spring/kafka-keonsyumeo-geurup", "spring/kafka-ereo-haendeulreo"]
        }
      ]
    },
    {
      name: "Kafka 신뢰성",
      compare: {
        cols: ["기준", "Kafka 멱등 프로듀서", "Kafka 트랜잭션"],
        rows: [
          ["막는 문제", "재전송으로 인한 파티션 내 중복 기록", "여러 토픽 쓰기·오프셋 커밋의 부분 반영"],
          ["설정", "enable.idempotence=true (3.0+ 기본)", "transaction-id-prefix 설정"],
          ["범위", "한 프로듀서 세션, 한 파티션", "여러 파티션·토픽 + 소비 오프셋"],
          ["소비 측 요구", "없음", "isolation.level=read_committed"],
          ["DB와 원자성", "없음", "없음 (아웃박스 필요)"]
        ]
      },
      concepts: [
        {
          id: "spring/kafka-ereo-haendeulreo",
          slug: "kafka-ereo-haendeulreo",
          title: "Kafka 에러 핸들러",
          deep: true,
          def: "리스너에서 예외가 났을 때 재시도, 건너뛰기, DLT 전송을 결정하는 Spring Kafka의 `CommonErrorHandler`로, 기본 구현은 `DefaultErrorHandler`다.",
          why: "예외를 그냥 두면 같은 레코드를 계속 다시 읽어 파티션 전체가 막히거나(독 메시지), 반대로 커밋해 버려 메시지를 잃는다. 일시적 오류는 재시도하고 영구 오류는 따로 빼서 소비를 계속하기 위해서다.",
          how: [
            "1) 리스너가 예외를 던지면 컨테이너가 `DefaultErrorHandler`에 넘긴다.",
            "2) 실패한 레코드와 그 뒤 레코드의 오프셋으로 seek해 다음 poll에서 다시 받는다(blocking 재시도).",
            "3) `BackOff`에 정한 횟수만큼 재시도한다. 기본은 `FixedBackOff(0, 9)`로 지연 없이 최대 10번 시도한다.",
            "4) 재시도를 모두 실패하면 `ConsumerRecordRecoverer`(보통 `DeadLetterPublishingRecoverer`)를 호출하고 오프셋을 커밋해 다음 레코드로 넘어간다.",
            "- `addNotRetryableExceptions()`: 검증 실패처럼 다시 해도 소용없는 예외는 바로 복구 단계로 보낸다.",
            "- 역직렬화 실패는 리스너까지 오지 못하므로 `ErrorHandlingDeserializer`로 감싸야 에러 핸들러가 처리할 수 있다.",
            "- 부트 3은 `CommonErrorHandler` 빈이 있으면 리스너 컨테이너 팩토리에 자동으로 연결한다."
          ],
          flow: [
            "리스너 예외 발생",
            "DefaultErrorHandler 호출",
            "실패 오프셋으로 seek",
            "백오프 후 재시도",
            "횟수 초과 시 recoverer",
            "DLT 전송 후 오프셋 커밋"
          ],
          code: "@Bean\nDefaultErrorHandler kafkaErrorHandler(KafkaTemplate<Object, Object> template) {\n    var recoverer = new DeadLetterPublishingRecoverer(template); // 원본토픽.DLT로 전송\n    var backOff = new ExponentialBackOffWithMaxRetries(3);\n    backOff.setInitialInterval(1_000L);\n    backOff.setMultiplier(2.0);\n\n    var handler = new DefaultErrorHandler(recoverer, backOff);\n    handler.addNotRetryableExceptions(IllegalArgumentException.class);\n    return handler;\n}",
          codeLang: "java",
          use: [
            "외부 API 일시 장애에는 지수 백오프로 3번 재시도하고 실패하면 DLT로 보낸다.",
            "역직렬화 실패 메시지를 ErrorHandlingDeserializer로 받아 재시도 없이 바로 DLT로 보낸다."
          ],
          warn: [
            "blocking 재시도 중에는 그 파티션의 뒤 메시지가 처리되지 않는다. 대기 시간 합이 `max.poll.interval.ms`를 넘지 않게 한다.",
            "오래 기다려야 하는 재시도는 `@RetryableTopic`의 non-blocking 재시도(재시도 토픽)로 분리한다. 대신 순서가 깨진다."
          ],
          myth: [
            [
              "리스너에서 예외가 나면 그 메시지는 건너뛰고 다음으로 간다.",
              "기본 DefaultErrorHandler는 같은 레코드를 최대 10번 다시 시도한 뒤에야 로그만 남기고 넘어간다. 그동안 그 파티션은 막힌다."
            ]
          ],
          answer: "Spring Kafka는 리스너 예외를 CommonErrorHandler로 처리하고, 기본 구현인 DefaultErrorHandler는 실패한 레코드로 seek해 백오프만큼 재시도합니다. 재시도를 모두 실패하면 DeadLetterPublishingRecoverer 같은 복구기를 호출해 DLT로 보내고 오프셋을 넘겨 다음 메시지를 처리합니다. 재시도해도 소용없는 예외는 not-retryable로 등록해 바로 DLT로 보냅니다.",
          analogy: "택배 기사가 부재중이면 몇 번 재방문하고, 그래도 안 되면 보관소에 맡기고 다음 집으로 가는 것과 같습니다.",
          qa: [
            "Kafka 컨슈머에서 처리에 실패한 메시지는 어떻게 다루나요?",
            "DefaultErrorHandler에 백오프를 설정해 일시적 오류는 몇 번 재시도하고, 그래도 실패하면 DeadLetterPublishingRecoverer로 DLT에 보낸 뒤 오프셋을 커밋해 다음 메시지를 계속 처리합니다. 검증 오류처럼 재시도가 의미 없는 예외는 바로 DLT로 보내고, DLT는 모니터링하다 원인을 고친 뒤 재처리합니다."
          ],
          followUps: [
            [
              "blocking 재시도와 non-blocking 재시도는 어떻게 다른가요?",
              "DefaultErrorHandler의 blocking 재시도는 같은 파티션에서 그 레코드를 다시 시도하므로 순서는 지키지만 뒤 메시지가 기다립니다. @RetryableTopic의 non-blocking 재시도는 실패 메시지를 재시도 토픽으로 옮겨 원래 파티션은 계속 흐르지만 순서가 깨집니다."
            ],
            [
              "독 메시지(poison pill)는 어떻게 처리하나요?",
              "역직렬화가 실패하는 메시지는 ErrorHandlingDeserializer로 감싸 예외를 에러 핸들러로 넘기고, not-retryable로 분류해 재시도 없이 DLT로 보냅니다. 그러지 않으면 같은 메시지를 계속 읽으며 파티션이 멈춥니다."
            ]
          ],
          related: ["spring/kafka-dlt", "spring/kafka-ackmode", "spring/kafkalistener"]
        },
        {
          id: "spring/kafka-dlt",
          slug: "kafka-dlt",
          title: "Kafka DLT",
          deep: false,
          def: "재시도로도 처리하지 못한 메시지를 따로 보관하는 Dead Letter Topic으로, 소비를 막지 않고 실패 메시지를 나중에 분석·재처리하게 한다.",
          why: "처리할 수 없는 메시지 하나가 파티션 소비를 계속 막거나 유실되는 것을 막고 나중에 분석·재처리하기 위해서다.",
          how: [
            "`DeadLetterPublishingRecoverer`는 기본으로 `원본토픽.DLT`의 같은 파티션 번호로 보낸다. 그래서 DLT의 파티션 수는 원본 이상이어야 한다.",
            "원본 토픽, 파티션, 오프셋, 예외 클래스와 메시지, 스택 트레이스를 `kafka_dlt-*` 헤더에 담아 보낸다.",
            "`@RetryableTopic`을 쓰면 `토픽-retry-N`, `토픽-dlt` 토픽을 자동으로 만들고 `@DltHandler` 메서드로 DLT를 소비한다.",
            "DLT는 쌓아 두기만 하면 의미가 없다. 알림을 걸고, 원인 수정 후 원본 토픽으로 다시 보내는 재처리 도구를 둔다."
          ],
          use: ["DLT 메시지 수에 알림을 걸어 연동 장애를 빨리 감지한다.", "버그 수정 배포 후 DLT 메시지를 원본 토픽으로 다시 발행해 재처리한다."],
          answer: "DLT는 재시도로도 처리하지 못한 메시지를 모아 두는 토픽입니다. DeadLetterPublishingRecoverer는 기본으로 원본토픽.DLT의 같은 파티션으로 보내고, 원본 위치와 예외 정보를 헤더에 담습니다. 쌓아 두기만 하지 않고 알림과 재처리 도구를 함께 운영해야 의미가 있습니다.",
          analogy: "반송 우편함과 같습니다. 배달 못 한 편지를 버리지 않고 사유를 붙여 따로 모아 둡니다.",
          followUps: [
            [
              "DLT 메시지는 어떻게 재처리하나요?",
              "헤더에 담긴 원본 토픽과 예외 정보를 보고 원인을 고친 뒤, 관리자 API나 별도 리스너로 DLT를 읽어 원본 토픽에 다시 보냅니다. 재처리도 실패할 수 있으므로 무한 반복되지 않게 재처리 횟수를 헤더로 관리합니다."
            ]
          ],
          related: ["spring/kafka-ereo-haendeulreo"]
        },
        {
          id: "spring/kafka-myeokdeung-peurodyuseo",
          slug: "kafka-myeokdeung-peurodyuseo",
          title: "Kafka 멱등 프로듀서",
          deep: false,
          def: "프로듀서 재전송으로 같은 메시지가 파티션에 두 번 기록되는 것을 브로커가 프로듀서 ID와 시퀀스 번호로 걸러 내는 기능이다.",
          why: "응답을 못 받은 프로듀서의 재전송 때문에 같은 메시지가 파티션에 중복 기록되는 것을 막기 위해서다.",
          how: [
            "네트워크 오류로 응답을 못 받은 프로듀서가 재전송하면 중복 기록이 생길 수 있다. 멱등 프로듀서는 이를 막는다.",
            "Kafka 클라이언트 3.0부터 `enable.idempotence=true`, `acks=all`이 기본값이다. 부트에서는 `spring.kafka.producer.acks`, `properties.enable.idempotence`로 확인·지정한다.",
            "보장 범위는 한 프로듀서 세션, 한 파티션 안의 중복 방지다. 애플리케이션이 같은 이벤트를 두 번 `send()`하는 것은 막지 못한다."
          ],
          use: ["결제 이벤트 프로듀서에서 acks=all과 멱등성이 켜져 있는지 확인해 네트워크 재시도로 인한 중복 기록을 막는다."],
          warn: ["멱등 프로듀서가 있어도 컨슈머 쪽 중복(커밋 전 장애)은 남는다. 소비 측 멱등 처리는 따로 필요하다."],
          myth: [
            [
              "멱등 프로듀서를 켜면 end-to-end exactly-once가 된다.",
              "프로듀서 재전송 중복만 막는다. 소비 측 중복은 트랜잭션이나 멱등한 리스너로 따로 처리한다."
            ]
          ],
          answer: "멱등 프로듀서는 재전송으로 같은 메시지가 파티션에 두 번 쓰이는 것을 브로커가 프로듀서 ID와 시퀀스 번호로 막는 기능입니다. Kafka 클라이언트 3.0부터 acks=all과 함께 기본으로 켜져 있습니다. 다만 애플리케이션이 같은 이벤트를 두 번 보내거나 컨슈머가 다시 읽는 중복은 막지 못합니다.",
          followUps: [
            [
              "acks=all은 왜 함께 필요한가요?",
              "리더 하나만 받은 상태에서 리더가 죽으면 메시지가 사라질 수 있어, 모든 동기화 복제본이 받았을 때 성공으로 처리해야 유실과 중복을 함께 막을 수 있습니다. 그래서 멱등성을 켜면 acks=all이 요구됩니다."
            ]
          ],
          related: ["spring/kafka-teuraenjaeksyeon", "spring/kafkatemplate", "spring/kafkalistener"]
        },
        {
          id: "spring/kafka-teuraenjaeksyeon",
          slug: "kafka-teuraenjaeksyeon",
          title: "Kafka 트랜잭션",
          deep: false,
          def: "여러 토픽으로의 전송과 소비 오프셋 커밋을 하나의 Kafka 트랜잭션으로 묶어 모두 반영되거나 모두 취소되게 하는 기능이다.",
          why: "소비, 처리, 전송 중 일부만 반영되어 메시지가 유실되거나 중복되는 것을 막고 정확히 한 번 처리를 보장하기 위해서다.",
          how: [
            "`spring.kafka.producer.transaction-id-prefix`를 설정하면 트랜잭션 프로듀서가 켜지고 부트가 `KafkaTransactionManager`를 등록한다.",
            "`kafkaTemplate.executeInTransaction(...)`이나 `@Transactional`로 전송을 묶는다.",
            "리스너 컨테이너에 트랜잭션 매니저가 있으면 \"읽기 → 처리 → 다른 토픽에 쓰기 → 오프셋 커밋\"이 한 트랜잭션이 되어 Kafka 안에서 exactly-once가 된다.",
            "소비 측은 `isolation.level=read_committed`로 커밋된 메시지만 읽어야 한다."
          ],
          flow: ["트랜잭션 시작", "레코드 소비", "처리 후 다른 토픽에 send", "소비 오프셋을 트랜잭션에 포함", "커밋 또는 중단"],
          use: [
            "주문 토픽을 읽어 가공한 결과를 결제 토픽에 쓰는 스트림 처리에서 exactly-once를 보장한다.",
            "여러 토픽에 동시에 알리는 이벤트를 `executeInTransaction`으로 묶어 일부만 발행되는 것을 막는다."
          ],
          warn: [
            "DB 트랜잭션과 Kafka 트랜잭션은 하나의 원자적 트랜잭션이 아니다. 한쪽만 커밋될 수 있으므로 DB와 이벤트를 함께 보장하려면 트랜잭셔널 아웃박스 패턴을 쓴다.",
            "트랜잭션 프로듀서를 켜면 `send()`는 트랜잭션 안에서 실행되어야 하며, 밖에서 보내면 예외가 난다. 트랜잭션 없이도 보내야 하면 `setAllowNonTransactional(true)`를 켠다."
          ],
          myth: [
            [
              "@Transactional 하나로 DB 저장과 Kafka 전송이 함께 롤백된다.",
              "두 자원은 별개의 트랜잭션이라 한쪽만 커밋될 수 있다. 아웃박스 패턴으로 DB 커밋에 이벤트 기록을 묶는다."
            ]
          ],
          answer: "Kafka 트랜잭션은 여러 토픽으로의 전송과 소비 오프셋 커밋을 하나로 묶어 모두 반영하거나 모두 취소합니다. 스프링에서는 transaction-id-prefix를 설정하면 KafkaTransactionManager가 등록되고, 리스너 컨테이너가 읽기-처리-쓰기를 한 트랜잭션으로 실행합니다. 하지만 DB 트랜잭션과는 원자적으로 묶이지 않아 DB와 함께라면 아웃박스 패턴을 씁니다.",
          followUps: [
            [
              "트랜잭셔널 아웃박스 패턴은 무엇인가요?",
              "비즈니스 데이터와 보낼 이벤트를 같은 DB 트랜잭션으로 아웃박스 테이블에 저장하고, 별도 프로세스(스케줄러나 CDC)가 테이블을 읽어 Kafka로 발행하는 방식입니다. DB 커밋과 이벤트 기록이 원자적이 되고, 발행은 최소 한 번이 되므로 소비 측을 멱등하게 만듭니다."
            ]
          ],
          related: [
            "spring/kafka-myeokdeung-peurodyuseo",
            "spring/teuraenjaeksyeon-maenijeo",
            "spring/teuraenjaeksyeon-ibenteu-riseuneo"
          ]
        }
      ]
    },
    {
      name: "애플리케이션 이벤트",
      compare: {
        cols: ["기준", "@EventListener", "비동기 이벤트 리스너", "트랜잭션 이벤트 리스너"],
        rows: [
          ["실행 스레드", "발행자 스레드", "별도 스레드", "발행자 스레드 (기본)"],
          ["실행 시점", "publishEvent 호출 즉시", "즉시, 기다리지 않음", "커밋 후 등 지정한 단계"],
          ["발행자 트랜잭션", "공유", "공유 안 함", "이미 끝난 뒤"],
          ["예외 전파", "발행자에게 전파", "전파 안 됨", "전파 안 됨 (AFTER_COMMIT)"],
          ["대표 쓰임", "같은 트랜잭션 안의 후속 처리", "느린 부가 작업 분리", "커밋된 데이터 기준 알림·연동"]
        ]
      },
      concepts: [
        {
          id: "spring/applicationeventpublisher",
          slug: "applicationeventpublisher",
          title: "ApplicationEventPublisher",
          deep: false,
          def: "스프링 컨테이너 안에서 이벤트를 발행하는 인터페이스로, ApplicationContext가 이 역할을 구현한다.",
          why: "주문 완료 후 알림, 포인트 적립 같은 후속 작업을 직접 호출하지 않아 서비스 간 결합도를 낮추기 위해서다.",
          how: [
            "빈에 `ApplicationEventPublisher`를 주입받아 `publishEvent(event)`를 호출한다.",
            "스프링 4.2부터 `ApplicationEvent`를 상속하지 않은 일반 객체(record 권장)도 이벤트로 보낼 수 있다.",
            "발행 측은 누가 듣는지 모르므로, 주문 서비스가 포인트·알림 서비스를 직접 의존하지 않게 결합을 끊는다.",
            "같은 JVM 안의 통신이다. 서버가 죽으면 처리되지 않은 이벤트는 사라지므로 서비스 간·유실 불가 메시지는 Kafka 같은 브로커를 쓴다."
          ],
          use: ["주문 서비스가 포인트, 쿠폰, 알림 서비스를 직접 호출하지 않고 주문 완료 이벤트만 발행한다.", "서로를 참조하던 두 서비스의 순환 의존을 이벤트로 끊는다."],
          answer: "ApplicationEventPublisher는 스프링 컨테이너 안에서 이벤트를 발행하는 인터페이스이고, ApplicationContext가 구현합니다. 스프링 4.2부터 일반 객체도 이벤트로 보낼 수 있어 record로 이벤트를 정의합니다. 발행자는 누가 듣는지 모르므로 서비스 간 직접 의존을 끊을 수 있습니다.",
          analogy: "사내 방송과 같습니다. 방송하는 사람은 누가 듣는지 모르고, 관심 있는 부서만 듣고 움직입니다.",
          followUps: [
            [
              "스프링 이벤트와 Kafka는 언제 각각 쓰나요?",
              "스프링 이벤트는 한 애플리케이션 안에서 모듈 간 결합을 끊을 때 쓰고, 메모리로 전달되어 서버가 죽으면 유실됩니다. 다른 서비스로 전달하거나 유실되면 안 되는 이벤트는 Kafka 같은 브로커에 저장해 보냅니다."
            ]
          ],
          related: ["spring/eventlistener", "spring/applicationcontext", "spring/sunhwan-chamjo"]
        },
        {
          id: "spring/eventlistener",
          slug: "eventlistener",
          title: "@EventListener",
          deep: true,
          def: "메서드에 붙여 파라미터 타입에 맞는 애플리케이션 이벤트를 받아 처리하게 하는 애너테이션이다.",
          why: "부가 기능(알림, 포인트, 로그)을 핵심 로직에서 떼어 내 서비스 간 직접 의존을 없애고, 기능을 추가할 때 발행 코드를 고치지 않기 위해서다.",
          how: [
            "1) 발행자가 `publishEvent(new OrderCreated(...))`를 호출한다.",
            "2) `ApplicationEventMulticaster`가 이벤트 타입에 맞는 리스너를 찾는다.",
            "3) 기본은 동기 실행이다. 발행한 스레드에서 리스너를 차례로 호출하고, 모두 끝나야 `publishEvent()`가 반환된다.",
            "4) 같은 스레드이므로 발행자의 트랜잭션 안에서 실행되고, 리스너 예외는 발행자에게 전파되어 트랜잭션이 롤백될 수 있다.",
            "- `condition`: SpEL로 처리할 이벤트를 거른다. `condition = \"#event.amount > 10000\"`.",
            "- `@Order`: 여러 리스너의 실행 순서를 정한다.",
            "- 반환값이 있으면 그 값이 새 이벤트로 다시 발행된다."
          ],
          flow: ["publishEvent 호출", "Multicaster가 리스너 탐색", "condition 평가", "같은 스레드에서 리스너 실행", "모든 리스너 완료 후 반환"],
          code: "public record OrderCreated(Long orderId, Long userId, int amount) { }\n\n@Service\n@RequiredArgsConstructor\npublic class OrderService {\n    private final ApplicationEventPublisher publisher;\n\n    @Transactional\n    public void order(OrderCommand cmd) {\n        Order order = orderRepository.save(Order.from(cmd));\n        publisher.publishEvent(new OrderCreated(order.getId(), cmd.userId(), cmd.amount()));\n    }\n}\n\n@Component\npublic class PointEventHandler {\n    @EventListener\n    public void handle(OrderCreated event) {\n        // 발행자와 같은 스레드, 같은 트랜잭션에서 실행된다\n    }\n}",
          codeLang: "java",
          use: [
            "회원 가입 후 기본 설정 데이터 생성을 같은 트랜잭션 안의 리스너로 분리한다.",
            "`ContextRefreshedEvent`, `ApplicationReadyEvent`를 받아 기동 직후 캐시 예열을 한다."
          ],
          warn: [
            "동기 리스너가 외부 API를 호출하면 그 시간만큼 발행자의 트랜잭션과 응답이 늦어진다.",
            "커밋 전에 실행되므로 이후 롤백되면 이미 보낸 알림을 되돌릴 수 없다. 커밋 후 처리가 필요하면 `@TransactionalEventListener`를 쓴다."
          ],
          myth: [
            [
              "이벤트를 쓰면 자동으로 비동기 처리된다.",
              "@EventListener는 기본이 동기다. 비동기는 @Async를 붙이거나 Multicaster에 실행기를 지정해야 한다."
            ]
          ],
          answer: "@EventListener는 파라미터 타입에 맞는 이벤트를 받아 처리하는 메서드를 등록합니다. 기본은 동기라서 발행한 스레드에서 실행되고, 발행자의 트랜잭션을 공유하며 예외도 발행자에게 전파됩니다. 커밋 후에 처리해야 하면 @TransactionalEventListener, 별도 스레드가 필요하면 @Async를 함께 씁니다.",
          analogy: "회의 중에 바로 옆 사람에게 일을 넘기는 것과 같습니다. 그 사람이 끝내야 회의가 다음으로 진행됩니다.",
          qa: [
            "@EventListener는 동기인가요, 비동기인가요?",
            "기본은 동기입니다. 발행한 스레드에서 리스너가 실행되고 모두 끝나야 publishEvent가 반환되며, 발행자의 트랜잭션도 공유하고 예외도 발행자에게 전파됩니다. 비동기로 처리하려면 @Async를 함께 붙이고, 커밋이 끝난 뒤에 처리해야 하면 @TransactionalEventListener를 씁니다."
          ],
          followUps: [
            [
              "리스너에서 예외가 나면 발행자의 트랜잭션은 어떻게 되나요?",
              "동기 리스너는 같은 스레드에서 실행되므로 예외가 publishEvent를 통해 발행자에게 그대로 전파되고, 잡지 않으면 발행자의 트랜잭션이 롤백됩니다. 부가 기능 실패로 핵심 로직이 롤백되면 안 되면 커밋 후 리스너나 비동기로 분리합니다."
            ],
            [
              "여러 리스너의 실행 순서는 어떻게 정하나요?",
              "@Order로 정할 수 있습니다. 다만 순서에 의존하는 설계는 리스너 간 결합을 만들므로, 순서가 중요하면 한 리스너에서 명시적으로 처리하는 편이 낫습니다."
            ]
          ],
          related: [
            "spring/applicationeventpublisher",
            "spring/bidonggi-ibenteu-riseuneo",
            "spring/teuraenjaeksyeon-ibenteu-riseuneo"
          ]
        },
        {
          id: "spring/bidonggi-ibenteu-riseuneo",
          slug: "bidonggi-ibenteu-riseuneo",
          title: "비동기 이벤트 리스너",
          deep: false,
          def: "`@EventListener`에 `@Async`를 함께 붙여 이벤트를 별도 스레드에서 처리하게 하는 방식이다.",
          why: "부가 작업인 이벤트 처리가 느리거나 실패해도 발행자의 응답 시간과 결과에 영향을 주지 않게 하기 위해서다.",
          how: [
            "`@EnableAsync`가 필요하며, 발행자는 리스너 완료를 기다리지 않고 바로 반환된다.",
            "별도 스레드라 발행자의 트랜잭션과 `ThreadLocal`(보안 컨텍스트, MDC)이 전달되지 않는다.",
            "리스너 예외는 발행자에게 전파되지 않고 `AsyncUncaughtExceptionHandler`로 간다. 직접 로그와 재처리를 챙겨야 한다.",
            "`@TransactionalEventListener(phase = AFTER_COMMIT)`과 `@Async`를 함께 쓰면 \"커밋 후, 별도 스레드에서\" 처리하는 흔한 조합이 된다.",
            "`ApplicationEventMulticaster`에 TaskExecutor를 지정하면 모든 리스너가 비동기가 되므로 보통 `@Async`로 필요한 리스너만 고른다."
          ],
          use: [
            "주문 커밋 후 알림톡 발송을 `@Async @TransactionalEventListener`로 처리해 주문 응답 시간을 줄인다.",
            "전용 스레드 풀을 지정해 이벤트 처리량이 늘어도 다른 비동기 작업과 스레드를 나눠 쓰지 않게 한다."
          ],
          warn: ["메모리 안에서만 전달되므로 처리 도중 서버가 종료되면 이벤트가 유실된다. 유실되면 안 되는 작업은 이벤트를 DB에 저장(아웃박스)하거나 메시지 브로커를 쓴다."],
          answer: "@EventListener에 @Async를 함께 붙이면 이벤트가 별도 스레드에서 처리되어 발행자는 기다리지 않습니다. 대신 발행자의 트랜잭션과 ThreadLocal이 전달되지 않고, 예외도 발행자에게 오지 않아 직접 로그와 재처리를 챙겨야 합니다. 보통 @TransactionalEventListener와 @Async를 함께 써서 커밋 후 별도 스레드에서 알림을 보냅니다.",
          followUps: [
            [
              "비동기 리스너에서 DB를 수정하면 트랜잭션은 어떻게 되나요?",
              "별도 스레드라 발행자의 트랜잭션이 없습니다. 리스너에 @Transactional을 붙여 새 트랜잭션을 열고, AFTER_COMMIT 리스너에서 동기로 DB를 수정하려면 REQUIRES_NEW가 필요합니다."
            ]
          ],
          related: [
            "spring/eventlistener",
            "spring/async",
            "spring/bidonggi-seuredeu-pul",
            "spring/teuraenjaeksyeon-ibenteu-riseuneo",
            "spring/threadlocal"
          ]
        }
      ]
    }
  ]
};

export default topic;
