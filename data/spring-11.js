(window.MINDMAP = window.MINDMAP || {})['spring-11'] = {
  name: '캐시 · 메시징',
  groups: [
    { name: '캐시 추상화', items: [
      { t: '캐시 추상화', deep: false,
        d: '`@EnableCaching`으로 켜는 스프링의 캐시 기능으로, 메서드 호출 결과를 저장해 두고 같은 인자로 다시 호출되면 메서드를 실행하지 않고 저장된 값을 돌려준다.',
        how: [
          '`@EnableCaching`을 붙이면 `@Cacheable` 같은 캐시 애너테이션이 붙은 빈을 AOP 프록시로 감싼다. 트랜잭션과 같은 프록시 기반 기능이다.',
          '비즈니스 코드는 `Cache`, `CacheManager` 인터페이스에만 의존하고, 실제 저장소(ConcurrentMap, Caffeine, Redis)는 설정으로 바꾼다.',
          '스프링 부트는 클래스패스를 보고 CacheManager를 자동 설정한다. 아무것도 없으면 TTL이 없는 `ConcurrentMapCacheManager`(simple)가 쓰인다.',
          '- 대상: 조회가 잦고 잘 바뀌지 않으며, 같은 입력이면 같은 결과가 나오는 메서드.',
          '- 비대상: 사용자마다 결과가 달라지는데 키에 사용자가 빠진 경우, 실시간 정확성이 필요한 재고·잔액.'
        ],
        warn: ['프록시 기반이라 같은 클래스 안에서 `this.find()`로 호출하면 캐시가 적용되지 않는다. private 메서드에도 적용되지 않는다.'],
        rel: ['@Cacheable', 'CacheManager', '셀프 호출 문제', '@Transactional 동작 원리'] },
      { t: '@Cacheable', deep: true,
        d: '캐시에 값이 있으면 메서드를 건너뛰고 캐시 값을 반환하고, 없으면 메서드를 실행한 뒤 결과를 캐시에 넣는 애너테이션이다.',
        why: 'DB나 외부 API처럼 비싼 조회를 반복하지 않아 응답 시간과 부하를 줄이면서도, 캐시 처리 코드를 비즈니스 로직과 분리하기 위해서다.',
        how: [
          '1) 프록시가 호출을 가로채 캐시 이름과 키(기본은 메서드 인자)를 계산한다.',
          '2) `condition`이 거짓이면 캐시를 쓰지 않고 바로 메서드를 실행한다.',
          '3) 캐시에 값이 있으면(hit) 메서드를 실행하지 않고 그 값을 반환한다.',
          '4) 없으면(miss) 메서드를 실행하고, `unless`가 거짓일 때만 결과를 캐시에 넣는다.',
          '- `key`: SpEL로 키 지정. `#id`, `#user.id`처럼 인자를 참조한다.',
          '- `condition`: 호출 전에 평가해 캐시 사용 여부를 정한다.',
          '- `unless`: 호출 후 `#result`를 보고 저장을 거부한다. `unless = "#result == null"`이 대표적이다.',
          '- `sync = true`: 같은 키를 동시에 조회할 때 한 스레드만 메서드를 실행하게 한다.',
          '`Optional`을 반환하면 내부 값이 캐시되고, 값이 없으면 null로 취급된다.'
        ],
        code: `@Configuration
@EnableCaching
public class CacheConfig { }

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    @Cacheable(cacheNames = "product", key = "#id", unless = "#result == null")
    public ProductDto findProduct(Long id) {
        return productRepository.findById(id).map(ProductDto::from).orElse(null);
    }

    @CacheEvict(cacheNames = "product", key = "#id")
    @Transactional
    public void updatePrice(Long id, int price) {
        productRepository.findById(id).orElseThrow().changePrice(price);
    }
}`,
        warn: [
          '엔티티를 그대로 캐시하면 지연 로딩 프록시와 직렬화 문제가 생긴다. 필요한 값만 담은 DTO를 캐시한다.',
          '로컬 캐시는 같은 객체 참조를 반환하므로 꺼낸 객체를 수정하면 캐시 내용이 바뀐다. 불변 객체를 캐시한다.',
          'TTL을 정하지 않으면 영원히 남는다. 기본 simple 캐시는 TTL과 크기 제한이 없다.'
        ],
        qa: ['@Cacheable이 동작하지 않는 경우는 언제인가요?', '프록시 기반이라 같은 클래스 안에서 this로 호출하면 프록시를 거치지 않아 캐시가 적용되지 않습니다. private 메서드나 new로 만든 객체, @EnableCaching을 빠뜨린 경우도 마찬가지입니다. 또 unless나 condition 조건, 키가 매번 달라지는 경우에도 캐시 히트가 나지 않습니다.'],
        rel: ['캐시 추상화', '@CachePut', '@CacheEvict', '캐시 키 설계', '캐시 스탬피드', '셀프 호출 문제'] },
      { t: '@CachePut', deep: false,
        d: '메서드를 항상 실행하고 그 결과로 캐시 값을 갱신하는 애너테이션이다.',
        how: [
          '`@Cacheable`과 달리 캐시 조회를 하지 않는다. 수정 메서드가 바뀐 결과를 반환할 때 캐시를 최신 값으로 덮어쓴다.',
          '키는 조회 메서드와 정확히 같아야 한다. 보통 `key = "#result.id"`나 `key = "#id"`를 쓴다.',
          '같은 메서드에 `@Cacheable`과 함께 붙이지 않는다. 동작이 충돌한다.'
        ],
        warn: ['트랜잭션 안에서 캐시를 먼저 갱신한 뒤 커밋이 롤백되면 캐시에만 바뀐 값이 남는다. 갱신보다 삭제(`@CacheEvict`)가 더 안전한 경우가 많다.'],
        rel: ['@Cacheable', '@CacheEvict', '캐시 일관성'] },
      { t: '@CacheEvict', deep: false,
        d: '메서드 실행 후 지정한 키 또는 캐시 전체를 삭제하는 애너테이션이다.',
        how: [
          '데이터가 바뀌는 수정·삭제 메서드에 붙여 다음 조회 때 최신 값을 다시 읽게 한다.',
          '- `key`: 특정 키만 삭제한다.',
          '- `allEntries = true`: 캐시 이름에 속한 전체를 비운다. 목록 캐시처럼 어떤 키가 영향받는지 알기 어려울 때 쓴다.',
          '- `beforeInvocation = true`: 메서드 실행 전에 삭제한다. 기본은 메서드가 정상 종료된 뒤 삭제하며, 예외가 나면 삭제하지 않는다.',
          '여러 캐시를 한 번에 다룰 때는 `@Caching(evict = {...})`로 묶는다.'
        ],
        warn: ['Redis 캐시의 `allEntries = true`는 기본으로 KEYS 명령으로 키를 찾아 지워 키가 많으면 Redis 전체가 멈출 수 있다. `RedisCacheWriter`에 `BatchStrategies.scan(1000)`을 지정해 SCAN으로 나눠 지운다.'],
        rel: ['@CachePut', '캐시 일관성', 'RedisCacheManager'] },
      { t: 'CacheManager', deep: false,
        d: '캐시 이름으로 `Cache` 객체를 찾아 주는 스프링 캐시 추상화의 핵심 인터페이스로, 구현체에 따라 실제 저장소가 정해진다.',
        how: [
          '- `ConcurrentMapCacheManager`: JVM 메모리의 Map. 부트 기본(simple)이며 TTL이 없어 테스트·개발용이다.',
          '- `CaffeineCacheManager`: 크기 제한과 만료를 지원하는 고성능 로컬 캐시.',
          '- `RedisCacheManager`: 여러 서버가 공유하는 원격 캐시.',
          '- `CompositeCacheManager`: 여러 매니저를 순서대로 조회한다.',
          '`spring.cache.type`으로 구현을 고르고, `spring.cache.cache-names`로 미리 만들 캐시 이름을 지정한다.',
          '캐시마다 TTL을 다르게 두려면 직접 CacheManager 빈이나 `RedisCacheManagerBuilderCustomizer`를 등록한다.'
        ],
        rel: ['Caffeine 로컬 캐시', 'RedisCacheManager', '자동 설정 원리'] },
      { t: '캐시 키 설계', deep: false,
        d: '캐시 이름과 키를 어떻게 구성해 충돌 없이 원하는 범위로 값을 저장할지 정하는 일이다.',
        how: [
          '기본 `SimpleKeyGenerator`는 인자만으로 키를 만든다. 인자가 없으면 `SimpleKey.EMPTY`, 하나면 그 값, 여러 개면 `SimpleKey(인자들)`이다.',
          '메서드 이름은 키에 들어가지 않는다. 같은 캐시 이름을 쓰는 두 메서드가 같은 인자를 받으면 서로의 값을 덮어쓴다. 캐시 이름을 메서드 용도별로 나눈다.',
          '- 결과에 영향을 주는 값(사용자, 언어, 페이지 번호)은 모두 키에 넣는다.',
          '- 키로 쓰는 객체는 `equals`/`hashCode`가 올바르게 구현되어야 한다(record 권장).',
          '- Redis에서는 `cacheName::key` 형태로 저장되므로 키의 `toString()` 결과가 사람이 읽을 수 있어야 운영이 쉽다.',
          '- 배포로 캐시 값 구조가 바뀌면 이전 형식과 섞이지 않게 키 접두사에 버전을 둔다.'
        ],
        code: `@Cacheable(cacheNames = "productPage", key = "#category + ':' + #page + ':' + #size")
public List<ProductDto> findByCategory(String category, int page, int size) { ... }`,
        rel: ['@Cacheable', 'RedisCacheManager'] }
    ]},
    { name: '캐시 저장소 · 운영', items: [
      { t: 'Caffeine 로컬 캐시', deep: false,
        d: '애플리케이션 JVM 힙 안에 값을 저장하는 고성능 로컬 캐시 라이브러리로, `CaffeineCacheManager`로 스프링 캐시에 연결한다.',
        how: [
          '`spring.cache.type=caffeine`, `spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=10m`처럼 크기와 만료를 지정한다.',
          '네트워크 왕복과 직렬화가 없어 가장 빠르다. 객체가 그대로 저장된다.',
          '서버마다 캐시가 따로라서 한 서버에서 삭제해도 다른 서버에는 이전 값이 남는다.',
          '- 적합: 코드성 데이터, 설정값, 변경이 드물고 조금 늦게 반영돼도 되는 데이터.',
          '- 부적합: 서버 간에 즉시 같아야 하는 데이터, 용량이 큰 데이터.'
        ],
        warn: ['캐시 크기를 정하지 않으면 힙을 계속 차지해 GC 부담과 OOM을 부른다. `maximumSize`를 반드시 둔다.'],
        rel: ['RedisCacheManager', 'CacheManager', '캐시 일관성'] },
      { t: 'RedisCacheManager', deep: false,
        d: 'Redis를 저장소로 쓰는 CacheManager로, 여러 서버가 같은 캐시를 공유하게 한다.',
        how: [
          '`spring-boot-starter-data-redis`와 `spring.cache.type=redis`로 자동 설정되며 `spring.cache.redis.time-to-live`로 기본 TTL을 정한다.',
          '`RedisCacheConfiguration`으로 TTL, 키 접두사, 값 직렬화, null 저장 여부를 정한다. 캐시별 TTL은 `withCacheConfiguration`으로 따로 준다.',
          '기본 값 직렬화는 JDK 직렬화라 클래스가 `Serializable`이어야 하고 사람이 읽을 수 없다. JSON 직렬화로 바꾸는 경우가 많다.',
          '`transactionAware()`를 켜면 트랜잭션 안의 put/evict가 커밋 후에 반영된다.'
        ],
        code: `@Bean
RedisCacheManagerBuilderCustomizer cacheCustomizer() {
    RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
        .entryTtl(Duration.ofMinutes(10))
        .disableCachingNullValues()
        .serializeValuesWith(SerializationPair.fromSerializer(
            new GenericJackson2JsonRedisSerializer()));
    return builder -> builder
        .cacheDefaults(base)
        .withCacheConfiguration("product", base.entryTtl(Duration.ofMinutes(30)));
}`,
        warn: ['DTO 클래스의 패키지나 필드가 바뀌면 이전에 저장된 JSON을 역직렬화하지 못해 오류가 난다. 배포 시 키 버전을 올리거나 캐시를 비운다.'],
        rel: ['Caffeine 로컬 캐시', 'Redis 직렬화 설정', 'CacheManager'] },
      { t: '캐시 일관성', deep: true,
        d: '원본 DB의 데이터와 캐시에 저장된 값이 어긋나지 않도록, 또는 어긋나는 시간을 허용 범위 안으로 줄이도록 관리하는 일이다.',
        why: '캐시는 원본의 복사본이라 갱신 순서, 트랜잭션 롤백, 여러 서버의 로컬 캐시 때문에 오래된 값을 보여 줄 수 있다. 어디까지 허용할지 정하지 않으면 장애와 데이터 불신으로 이어진다.',
        how: [
          '기본 패턴은 Cache-Aside다. 조회는 캐시 먼저(`@Cacheable`), 쓰기는 DB를 갱신한 뒤 캐시를 삭제(`@CacheEvict`)한다.',
          '1) 쓰기 요청이 트랜잭션 안에서 DB를 수정한다.',
          '2) 트랜잭션이 커밋된 뒤 캐시를 삭제한다. 커밋 전에 지우면 그 사이 조회가 옛 값을 다시 캐시에 넣는다.',
          '3) 다음 조회가 캐시 미스를 내고 DB의 최신 값을 읽어 다시 캐시한다.',
          '4) 모든 키에 TTL을 두어, 삭제가 누락되더라도 일정 시간 뒤 스스로 맞춰지게 한다.',
          '- 커밋 후 삭제: `RedisCacheManager`의 `transactionAware()`, `TransactionAwareCacheManagerProxy`, 또는 `@TransactionalEventListener(AFTER_COMMIT)`에서 삭제한다.',
          '- 갱신보다 삭제: 동시 갱신 시 순서가 뒤바뀌어 옛 값으로 덮어쓰는 문제를 줄인다.',
          '- 로컬 캐시 다중 서버: Redis Pub/Sub이나 Kafka로 삭제 이벤트를 모든 서버에 전파하거나, TTL을 짧게 둔다.'
        ],
        code: `@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    RedisCacheManager cacheManager(RedisConnectionFactory cf) {
        return RedisCacheManager.builder(cf)
            .cacheDefaults(RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10)))
            .transactionAware() // 트랜잭션 안의 evict를 커밋 후에 실행
            .build();
    }
}`,
        warn: [
          '`@CacheEvict`와 `@Transactional`을 같은 메서드에 붙여도 프록시 순서에 따라 커밋 전에 삭제될 수 있다. transactionAware나 커밋 후 이벤트로 순서를 보장한다.',
          '정확성이 꼭 필요한 값(재고, 잔액, 결제 상태)은 캐시 값을 근거로 쓰기 판단을 하지 않는다. 쓰기는 항상 DB 기준으로 검증한다.'
        ],
        qa: ['DB를 수정할 때 캐시는 갱신하나요, 삭제하나요?', '보통 DB를 커밋한 뒤 캐시를 삭제합니다. 갱신은 동시 요청에서 순서가 뒤바뀌면 옛 값이 남을 수 있고, 계산 비용도 쓰기 쪽에 몰립니다. 삭제하면 다음 조회가 최신 값을 다시 채우고, 삭제가 누락되는 경우에 대비해 모든 캐시에 TTL을 둡니다.'],
        rel: ['@CacheEvict', '@CachePut', 'RedisCacheManager', 'Caffeine 로컬 캐시', '트랜잭션 이벤트 리스너'] },
      { t: '캐시 스탬피드', deep: false,
        d: '인기 키가 만료되는 순간 많은 요청이 동시에 캐시 미스를 내고 한꺼번에 DB로 몰리는 현상이다.',
        how: [
          '`@Cacheable(sync = true)`로 같은 키에 대해 한 스레드만 메서드를 실행하고 나머지는 결과를 기다리게 한다.',
          '`sync`는 한 JVM 안에서만 보장된다. 서버가 여러 대면 서버 수만큼은 DB를 조회한다.',
          '- TTL에 무작위 값을 더해 많은 키가 동시에 만료되지 않게 한다.',
          '- 아주 뜨거운 키는 만료 전에 스케줄러로 미리 갱신한다.',
          '- 여러 서버에서도 한 번만 계산해야 하면 Redis 분산 락을 쓴다.'
        ],
        warn: ['`sync = true`는 `unless`와 함께 쓸 수 없고, 다른 캐시 애너테이션과 조합할 수 없다.'],
        rel: ['@Cacheable', '분산 스케줄 락'] }
    ]},
    { name: 'Spring Data Redis', items: [
      { t: 'RedisTemplate', deep: false,
        d: 'Spring Data Redis가 제공하는 Redis 명령 실행 템플릿으로, 자바 객체를 직렬화해 문자열·해시·리스트·셋·정렬 셋 자료구조에 저장한다.',
        how: [
          '- `opsForValue()`: 문자열(GET/SET). 캐시, 카운터, 토큰 저장.',
          '- `opsForHash()`: 해시. 객체 필드 단위 저장.',
          '- `opsForList()`, `opsForSet()`, `opsForZSet()`: 큐, 중복 제거, 랭킹.',
          '키와 값은 설정한 `RedisSerializer`로 바이트 배열로 바뀐다. 기본은 JDK 직렬화라 대부분 직접 설정한다.',
          '여러 명령을 한 번에 보내려면 `executePipelined()`, 원자적으로 묶으려면 Lua 스크립트(`execute(RedisScript, ...)`)를 쓴다.',
          '`@Cacheable`로 표현하기 어려운 자료구조, 원자적 증가(`increment`), 만료 시간 제어가 필요할 때 직접 쓴다.'
        ],
        code: `@Bean
RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory cf) {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    template.setConnectionFactory(cf);
    template.setKeySerializer(new StringRedisSerializer());
    template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
    template.setHashKeySerializer(new StringRedisSerializer());
    template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
    return template;
}

// 사용
redisTemplate.opsForValue().set("session:" + id, dto, Duration.ofMinutes(30));
Long views = redisTemplate.opsForValue().increment("views:" + postId);`,
        warn: ['`multi()`/`exec()` 트랜잭션은 같은 커넥션에서 실행되어야 하므로 `SessionCallback` 안에서 쓴다. 그냥 연달아 호출하면 다른 커넥션으로 나가 동작하지 않는다.'],
        rel: ['StringRedisTemplate', 'Redis 직렬화 설정', 'Lettuce 커넥션'] },
      { t: 'StringRedisTemplate', deep: false,
        d: '키, 값, 해시 키, 해시 값을 모두 `StringRedisSerializer`로 다루는 `RedisTemplate<String, String>` 전용 클래스다.',
        how: [
          '부트가 `redisTemplate`(JDK 직렬화)과 함께 자동으로 등록한다.',
          'redis-cli에서 보이는 값과 코드에서 다루는 값이 같아 운영 중 확인이 쉽고, 다른 언어 서비스와도 그대로 공유된다.',
          '객체를 저장할 때는 `ObjectMapper`로 직접 JSON 문자열로 바꿔 넣는다. 타입 정보가 섞이지 않아 깔끔하다.',
          '카운터, 토큰, 분산 락 키처럼 값이 단순 문자열·숫자인 경우에 가장 많이 쓴다.'
        ],
        rel: ['RedisTemplate', 'Redis 직렬화 설정'] },
      { t: 'Redis 직렬화 설정', deep: false,
        d: '`RedisTemplate`과 `RedisCacheManager`가 자바 객체를 Redis 바이트로 바꾸는 `RedisSerializer`를 고르는 설정이다.',
        how: [
          '- `JdkSerializationRedisSerializer`: 기본값. `Serializable` 필수, 키가 `\\xac\\xed...`처럼 깨져 보이고 클래스가 바뀌면 역직렬화가 실패한다.',
          '- `StringRedisSerializer`: 문자열 그대로. 키에는 사실상 항상 이것을 쓴다.',
          '- `GenericJackson2JsonRedisSerializer`: JSON에 `@class` 타입 정보를 함께 저장해 어떤 타입이든 복원한다. 대신 클래스 이름이 데이터에 묶인다.',
          '- `Jackson2JsonRedisSerializer<T>`: 타입을 하나로 고정해 타입 정보 없이 저장한다. 캐시마다 타입이 정해진 경우에 적합하다.',
          '`LocalDateTime` 같은 Java 8 날짜 타입은 `JavaTimeModule`을 등록한 ObjectMapper를 넘겨야 직렬화된다.',
          'Spring Data Redis 4.0(부트 4)에서는 Jackson 3 기반 `GenericJacksonJsonRedisSerializer`가 추가되고 Jackson2 계열은 deprecated되었다.'
        ],
        warn: ['`GenericJackson2JsonRedisSerializer`로 저장한 뒤 DTO의 패키지를 옮기면 `@class` 값이 맞지 않아 기존 캐시를 읽지 못한다.'],
        rel: ['RedisTemplate', 'RedisCacheManager', 'HttpMessageConverter'] },
      { t: 'Lettuce 커넥션', deep: false,
        d: '스프링 부트의 기본 Redis 클라이언트로, Netty 기반 논블로킹 방식이라 하나의 커넥션을 여러 스레드가 안전하게 공유한다.',
        how: [
          '`spring.data.redis.host`, `port`, `timeout`으로 연결하고 `LettuceConnectionFactory`가 자동 등록된다.',
          '기본은 커넥션 하나를 공유한다. 명령이 파이프라인처럼 다중화되므로 일반 명령에는 풀이 필요 없다.',
          '`BLPOP` 같은 블로킹 명령이나 `MULTI` 트랜잭션은 전용 커넥션이 필요해 `commons-pool2`와 `spring.data.redis.lettuce.pool.enabled=true`로 풀을 쓴다.',
          '클러스터·센티널은 `spring.data.redis.cluster.nodes`, `sentinel.master` 설정으로 지원한다.',
          'Jedis도 쓸 수 있지만 커넥션이 스레드 안전하지 않아 반드시 풀을 써야 한다.'
        ],
        warn: ['`spring.data.redis.timeout`(명령 타임아웃)을 정하지 않으면 Redis 장애 시 요청 스레드가 오래 묶인다. 짧게 잡고 캐시 실패 시 DB로 넘어가게 한다.'],
        rel: ['RedisTemplate', '외부 호출 타임아웃'] }
    ]},
    { name: 'Spring Kafka 기본', items: [
      { t: 'KafkaTemplate', deep: false,
        d: 'Spring Kafka가 제공하는 프로듀서 템플릿으로, 토픽에 메시지를 보내고 전송 결과를 비동기로 돌려준다.',
        how: [
          '`spring.kafka.bootstrap-servers`, `producer.key-serializer`, `value-serializer`만 설정하면 부트가 `KafkaTemplate`을 자동 등록한다.',
          '`send(topic, key, value)`는 Spring Kafka 3.0부터 `CompletableFuture<SendResult>`를 반환한다(2.x의 `ListenableFuture`는 제거).',
          '같은 키는 같은 파티션으로 가므로, 순서가 중요한 메시지(같은 주문의 이벤트)는 주문 ID를 키로 준다.',
          '전송은 배치로 모아 보내므로 `send()`가 반환되어도 브로커에 도착한 것은 아니다. 결과 콜백이나 `get()`으로 확인한다.'
        ],
        code: `public void publish(OrderCreated event) {
    kafkaTemplate.send("order-created", event.orderId().toString(), event)
        .whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("전송 실패 orderId={}", event.orderId(), ex);
                return;
            }
            log.info("전송 완료 offset={}", result.getRecordMetadata().offset());
        });
}`,
        warn: ['JSON 직렬화(`JsonSerializer`)는 기본으로 타입 헤더를 넣는다. 소비 측 패키지가 다르면 역직렬화가 실패하므로 타입 매핑이나 신뢰 패키지를 설정한다.'],
        rel: ['@KafkaListener', 'Kafka 멱등 프로듀서', 'Kafka 트랜잭션'] },
      { t: '@KafkaListener', deep: true,
        d: '메서드에 붙여 지정한 토픽의 메시지를 소비하게 하는 애너테이션으로, 내부적으로 메시지 리스너 컨테이너가 poll 루프와 오프셋 커밋을 관리한다.',
        why: 'KafkaConsumer는 스레드 안전하지 않고 poll 루프, 커밋, 리밸런스, 에러 처리를 직접 구현해야 한다. 이를 컨테이너에 맡기고 개발자는 메시지 처리 로직만 쓰기 위해서다.',
        how: [
          '1) 기동 시 `@KafkaListener`를 찾아 `ConcurrentKafkaListenerContainerFactory`로 리스너 컨테이너를 만든다.',
          '2) 컨테이너는 `concurrency` 수만큼 컨슈머 스레드를 띄우고 각 스레드가 `poll()`로 레코드를 가져온다.',
          '3) 레코드를 역직렬화해 메서드 파라미터(`ConsumerRecord`, 페이로드, `@Header`, `Acknowledgment`)로 넘겨 호출한다.',
          '4) 정상 처리되면 AckMode에 따라 오프셋을 커밋하고, 예외가 나면 에러 핸들러가 재시도·DLT를 처리한다.',
          '- `groupId`: 컨슈머 그룹. 같은 그룹이면 파티션을 나눠 받는다.',
          '- `concurrency`: 컨슈머 스레드 수. 파티션 수보다 크면 남는 스레드는 논다.',
          '- `batch = "true"`: 레코드를 `List`로 한 번에 받는다.'
        ],
        code: `@Component
@RequiredArgsConstructor
public class OrderEventConsumer {
    private final PointService pointService;

    @KafkaListener(topics = "order-created", groupId = "point-service", concurrency = "3")
    public void onOrderCreated(OrderCreated event,
                               @Header(KafkaHeaders.RECEIVED_PARTITION) int partition) {
        // 같은 메시지가 다시 올 수 있으므로 멱등하게 처리한다
        if (pointService.alreadyProcessed(event.eventId())) return;
        pointService.earn(event.userId(), event.amount(), event.eventId());
    }
}`,
        warn: [
          'Kafka는 기본적으로 at-least-once라 같은 메시지가 두 번 올 수 있다. 처리 이력 테이블이나 유니크 키로 멱등하게 만든다.',
          '처리가 `max.poll.interval.ms`(기본 5분)보다 오래 걸리면 컨슈머가 그룹에서 빠지고 리밸런스가 일어나 중복 소비가 생긴다.'
        ],
        qa: ['@KafkaListener에서 같은 메시지가 중복으로 처리될 수 있는 이유와 대책은?', '오프셋은 처리 후에 커밋되는데, 처리 직후 커밋 전에 장애나 리밸런스가 나면 다음 컨슈머가 같은 오프셋부터 다시 읽습니다. 그래서 Kafka 소비는 최소 한 번 전달을 전제로 하고, 이벤트 ID를 처리 이력에 저장하거나 유니크 제약을 걸어 같은 메시지를 두 번 처리해도 결과가 같게 만듭니다.'],
        rel: ['Kafka 컨슈머 그룹', 'Kafka AckMode', 'Kafka 에러 핸들러', 'KafkaTemplate'] },
      { t: 'Kafka 컨슈머 그룹', deep: false,
        d: '같은 `groupId`를 가진 컨슈머들이 토픽의 파티션을 나눠 맡아 병렬로 소비하는 단위다.',
        how: [
          '파티션 하나는 그룹 안에서 한 컨슈머에게만 할당된다. 그래서 그룹 내 최대 병렬도는 파티션 수다.',
          '서로 다른 그룹은 같은 메시지를 각자 모두 받는다. 포인트 서비스와 알림 서비스가 같은 주문 이벤트를 각각 처리할 수 있다.',
          '서버가 늘거나 줄면 리밸런스로 파티션을 다시 나눈다. `partition.assignment.strategy`를 `CooperativeStickyAssignor`로 두면 전체 소비를 멈추지 않고 필요한 파티션만 옮기는 협력적 리밸런싱이 된다.',
          '`auto-offset-reset`은 커밋된 오프셋이 없을 때 시작 위치를 정한다(`latest` 기본, `earliest`).'
        ],
        warn: ['인스턴스 3대 × `concurrency` 3이면 컨슈머가 9개다. 파티션이 6개면 3개는 놀기 때문에 파티션 수에 맞춰 조정한다.'],
        rel: ['@KafkaListener', 'Kafka AckMode'] },
      { t: 'Kafka AckMode', deep: false,
        d: '리스너 컨테이너가 처리한 레코드의 오프셋을 언제 커밋할지 정하는 Spring Kafka 설정이다.',
        how: [
          'Spring Kafka는 기본으로 컨슈머의 `enable.auto.commit`을 끄고 컨테이너가 직접 커밋한다.',
          '- `BATCH`(기본): poll로 받은 레코드를 모두 처리한 뒤 한 번에 커밋.',
          '- `RECORD`: 레코드 하나 처리할 때마다 커밋. 중복이 적지만 커밋이 잦다.',
          '- `MANUAL`: 리스너가 `Acknowledgment.acknowledge()`를 호출한 것을 모아 다음 poll 전에 커밋.',
          '- `MANUAL_IMMEDIATE`: `acknowledge()` 호출 즉시 커밋.',
          '- `TIME`, `COUNT`, `COUNT_TIME`: 시간·개수 기준으로 모아서 커밋.',
          '`spring.kafka.listener.ack-mode`로 지정한다.'
        ],
        code: `// spring.kafka.listener.ack-mode=manual
@KafkaListener(topics = "payment", groupId = "settlement")
public void listen(PaymentEvent event, Acknowledgment ack) {
    settlementService.settle(event);
    ack.acknowledge(); // 처리 완료 후에만 커밋
}`,
        warn: ['수동 커밋에서 `acknowledge()`를 빠뜨리면 재시작 시 같은 메시지를 다시 받는다. 처리 실패 시에는 `acknowledge()` 대신 예외를 던져 에러 핸들러에 맡긴다.'],
        rel: ['@KafkaListener', 'Kafka 컨슈머 그룹', 'Kafka 에러 핸들러'] }
    ]},
    { name: 'Kafka 신뢰성', items: [
      { t: 'Kafka 에러 핸들러', deep: true,
        d: '리스너에서 예외가 났을 때 재시도, 건너뛰기, DLT 전송을 결정하는 Spring Kafka의 `CommonErrorHandler`로, 기본 구현은 `DefaultErrorHandler`다.',
        why: '예외를 그냥 두면 같은 레코드를 계속 다시 읽어 파티션 전체가 막히거나(독 메시지), 반대로 커밋해 버려 메시지를 잃는다. 일시적 오류는 재시도하고 영구 오류는 따로 빼서 소비를 계속하기 위해서다.',
        how: [
          '1) 리스너가 예외를 던지면 컨테이너가 `DefaultErrorHandler`에 넘긴다.',
          '2) 실패한 레코드와 그 뒤 레코드의 오프셋으로 seek해 다음 poll에서 다시 받는다(blocking 재시도).',
          '3) `BackOff`에 정한 횟수만큼 재시도한다. 기본은 `FixedBackOff(0, 9)`로 지연 없이 최대 10번 시도한다.',
          '4) 재시도를 모두 실패하면 `ConsumerRecordRecoverer`(보통 `DeadLetterPublishingRecoverer`)를 호출하고 오프셋을 커밋해 다음 레코드로 넘어간다.',
          '- `addNotRetryableExceptions()`: 검증 실패처럼 다시 해도 소용없는 예외는 바로 복구 단계로 보낸다.',
          '- 역직렬화 실패는 리스너까지 오지 못하므로 `ErrorHandlingDeserializer`로 감싸야 에러 핸들러가 처리할 수 있다.',
          '- 부트 3은 `CommonErrorHandler` 빈이 있으면 리스너 컨테이너 팩토리에 자동으로 연결한다.'
        ],
        code: `@Bean
DefaultErrorHandler kafkaErrorHandler(KafkaTemplate<Object, Object> template) {
    var recoverer = new DeadLetterPublishingRecoverer(template); // 원본토픽.DLT로 전송
    var backOff = new ExponentialBackOffWithMaxRetries(3);
    backOff.setInitialInterval(1_000L);
    backOff.setMultiplier(2.0);

    var handler = new DefaultErrorHandler(recoverer, backOff);
    handler.addNotRetryableExceptions(IllegalArgumentException.class);
    return handler;
}`,
        warn: [
          'blocking 재시도 중에는 그 파티션의 뒤 메시지가 처리되지 않는다. 대기 시간 합이 `max.poll.interval.ms`를 넘지 않게 한다.',
          '오래 기다려야 하는 재시도는 `@RetryableTopic`의 non-blocking 재시도(재시도 토픽)로 분리한다. 대신 순서가 깨진다.'
        ],
        qa: ['Kafka 컨슈머에서 처리에 실패한 메시지는 어떻게 다루나요?', 'DefaultErrorHandler에 백오프를 설정해 일시적 오류는 몇 번 재시도하고, 그래도 실패하면 DeadLetterPublishingRecoverer로 DLT에 보낸 뒤 오프셋을 커밋해 다음 메시지를 계속 처리합니다. 검증 오류처럼 재시도가 의미 없는 예외는 바로 DLT로 보내고, DLT는 모니터링하다 원인을 고친 뒤 재처리합니다.'],
        rel: ['Kafka DLT', 'Kafka AckMode', '@KafkaListener'] },
      { t: 'Kafka DLT', deep: false,
        d: '재시도로도 처리하지 못한 메시지를 따로 보관하는 Dead Letter Topic으로, 소비를 막지 않고 실패 메시지를 나중에 분석·재처리하게 한다.',
        how: [
          '`DeadLetterPublishingRecoverer`는 기본으로 `원본토픽.DLT`의 같은 파티션 번호로 보낸다. 그래서 DLT의 파티션 수는 원본 이상이어야 한다.',
          '원본 토픽, 파티션, 오프셋, 예외 클래스와 메시지, 스택 트레이스를 `kafka_dlt-*` 헤더에 담아 보낸다.',
          '`@RetryableTopic`을 쓰면 `토픽-retry-N`, `토픽-dlt` 토픽을 자동으로 만들고 `@DltHandler` 메서드로 DLT를 소비한다.',
          'DLT는 쌓아 두기만 하면 의미가 없다. 알림을 걸고, 원인 수정 후 원본 토픽으로 다시 보내는 재처리 도구를 둔다.'
        ],
        rel: ['Kafka 에러 핸들러'] },
      { t: 'Kafka 멱등 프로듀서', deep: false,
        d: '프로듀서 재전송으로 같은 메시지가 파티션에 두 번 기록되는 것을 브로커가 프로듀서 ID와 시퀀스 번호로 걸러 내는 기능이다.',
        how: [
          '네트워크 오류로 응답을 못 받은 프로듀서가 재전송하면 중복 기록이 생길 수 있다. 멱등 프로듀서는 이를 막는다.',
          'Kafka 클라이언트 3.0부터 `enable.idempotence=true`, `acks=all`이 기본값이다. 부트에서는 `spring.kafka.producer.acks`, `properties.enable.idempotence`로 확인·지정한다.',
          '보장 범위는 한 프로듀서 세션, 한 파티션 안의 중복 방지다. 애플리케이션이 같은 이벤트를 두 번 `send()`하는 것은 막지 못한다.'
        ],
        warn: ['멱등 프로듀서가 있어도 컨슈머 쪽 중복(커밋 전 장애)은 남는다. 소비 측 멱등 처리는 따로 필요하다.'],
        rel: ['Kafka 트랜잭션', 'KafkaTemplate', '@KafkaListener'] },
      { t: 'Kafka 트랜잭션', deep: false,
        d: '여러 토픽으로의 전송과 소비 오프셋 커밋을 하나의 Kafka 트랜잭션으로 묶어 모두 반영되거나 모두 취소되게 하는 기능이다.',
        how: [
          '`spring.kafka.producer.transaction-id-prefix`를 설정하면 트랜잭션 프로듀서가 켜지고 부트가 `KafkaTransactionManager`를 등록한다.',
          '`kafkaTemplate.executeInTransaction(...)`이나 `@Transactional`로 전송을 묶는다.',
          '리스너 컨테이너에 트랜잭션 매니저가 있으면 "읽기 → 처리 → 다른 토픽에 쓰기 → 오프셋 커밋"이 한 트랜잭션이 되어 Kafka 안에서 exactly-once가 된다.',
          '소비 측은 `isolation.level=read_committed`로 커밋된 메시지만 읽어야 한다.'
        ],
        warn: [
          'DB 트랜잭션과 Kafka 트랜잭션은 하나의 원자적 트랜잭션이 아니다. 한쪽만 커밋될 수 있으므로 DB와 이벤트를 함께 보장하려면 트랜잭셔널 아웃박스 패턴을 쓴다.',
          '트랜잭션 프로듀서를 켜면 `send()`는 트랜잭션 안에서 실행되어야 하며, 밖에서 보내면 예외가 난다. 트랜잭션 없이도 보내야 하면 `setAllowNonTransactional(true)`를 켠다.'
        ],
        rel: ['Kafka 멱등 프로듀서', '트랜잭션 매니저', '트랜잭션 이벤트 리스너'] }
    ]},
    { name: '애플리케이션 이벤트', items: [
      { t: 'ApplicationEventPublisher', deep: false,
        d: '스프링 컨테이너 안에서 이벤트를 발행하는 인터페이스로, ApplicationContext가 이 역할을 구현한다.',
        how: [
          '빈에 `ApplicationEventPublisher`를 주입받아 `publishEvent(event)`를 호출한다.',
          '스프링 4.2부터 `ApplicationEvent`를 상속하지 않은 일반 객체(record 권장)도 이벤트로 보낼 수 있다.',
          '발행 측은 누가 듣는지 모르므로, 주문 서비스가 포인트·알림 서비스를 직접 의존하지 않게 결합을 끊는다.',
          '같은 JVM 안의 통신이다. 서버가 죽으면 처리되지 않은 이벤트는 사라지므로 서비스 간·유실 불가 메시지는 Kafka 같은 브로커를 쓴다.'
        ],
        rel: ['@EventListener', 'ApplicationContext', '순환 참조'] },
      { t: '@EventListener', deep: true,
        d: '메서드에 붙여 파라미터 타입에 맞는 애플리케이션 이벤트를 받아 처리하게 하는 애너테이션이다.',
        why: '부가 기능(알림, 포인트, 로그)을 핵심 로직에서 떼어 내 서비스 간 직접 의존을 없애고, 기능을 추가할 때 발행 코드를 고치지 않기 위해서다.',
        how: [
          '1) 발행자가 `publishEvent(new OrderCreated(...))`를 호출한다.',
          '2) `ApplicationEventMulticaster`가 이벤트 타입에 맞는 리스너를 찾는다.',
          '3) 기본은 동기 실행이다. 발행한 스레드에서 리스너를 차례로 호출하고, 모두 끝나야 `publishEvent()`가 반환된다.',
          '4) 같은 스레드이므로 발행자의 트랜잭션 안에서 실행되고, 리스너 예외는 발행자에게 전파되어 트랜잭션이 롤백될 수 있다.',
          '- `condition`: SpEL로 처리할 이벤트를 거른다. `condition = "#event.amount > 10000"`.',
          '- `@Order`: 여러 리스너의 실행 순서를 정한다.',
          '- 반환값이 있으면 그 값이 새 이벤트로 다시 발행된다.'
        ],
        code: `public record OrderCreated(Long orderId, Long userId, int amount) { }

@Service
@RequiredArgsConstructor
public class OrderService {
    private final ApplicationEventPublisher publisher;

    @Transactional
    public void order(OrderCommand cmd) {
        Order order = orderRepository.save(Order.from(cmd));
        publisher.publishEvent(new OrderCreated(order.getId(), cmd.userId(), cmd.amount()));
    }
}

@Component
public class PointEventHandler {
    @EventListener
    public void handle(OrderCreated event) {
        // 발행자와 같은 스레드, 같은 트랜잭션에서 실행된다
    }
}`,
        warn: [
          '동기 리스너가 외부 API를 호출하면 그 시간만큼 발행자의 트랜잭션과 응답이 늦어진다.',
          '커밋 전에 실행되므로 이후 롤백되면 이미 보낸 알림을 되돌릴 수 없다. 커밋 후 처리가 필요하면 `@TransactionalEventListener`를 쓴다.'
        ],
        qa: ['@EventListener는 동기인가요, 비동기인가요?', '기본은 동기입니다. 발행한 스레드에서 리스너가 실행되고 모두 끝나야 publishEvent가 반환되며, 발행자의 트랜잭션도 공유하고 예외도 발행자에게 전파됩니다. 비동기로 처리하려면 @Async를 함께 붙이고, 커밋이 끝난 뒤에 처리해야 하면 @TransactionalEventListener를 씁니다.'],
        rel: ['ApplicationEventPublisher', '비동기 이벤트 리스너', '트랜잭션 이벤트 리스너'] },
      { t: '비동기 이벤트 리스너', deep: false,
        d: '`@EventListener`에 `@Async`를 함께 붙여 이벤트를 별도 스레드에서 처리하게 하는 방식이다.',
        how: [
          '`@EnableAsync`가 필요하며, 발행자는 리스너 완료를 기다리지 않고 바로 반환된다.',
          '별도 스레드라 발행자의 트랜잭션과 `ThreadLocal`(보안 컨텍스트, MDC)이 전달되지 않는다.',
          '리스너 예외는 발행자에게 전파되지 않고 `AsyncUncaughtExceptionHandler`로 간다. 직접 로그와 재처리를 챙겨야 한다.',
          '`@TransactionalEventListener(phase = AFTER_COMMIT)`과 `@Async`를 함께 쓰면 "커밋 후, 별도 스레드에서" 처리하는 흔한 조합이 된다.',
          '`ApplicationEventMulticaster`에 TaskExecutor를 지정하면 모든 리스너가 비동기가 되므로 보통 `@Async`로 필요한 리스너만 고른다.'
        ],
        warn: ['메모리 안에서만 전달되므로 처리 도중 서버가 종료되면 이벤트가 유실된다. 유실되면 안 되는 작업은 이벤트를 DB에 저장(아웃박스)하거나 메시지 브로커를 쓴다.'],
        rel: ['@EventListener', '@Async', '비동기 스레드 풀', '트랜잭션 이벤트 리스너', 'ThreadLocal'] }
    ]}
  ],
  must: [
    '캐시 애너테이션은 트랜잭션처럼 AOP 프록시로 동작한다. 같은 클래스 안 셀프 호출이나 private 메서드에는 캐시가 적용되지 않는다.',
    '캐시는 DTO를 TTL과 함께 저장하고, 쓰기 시에는 DB 커밋 후 캐시를 삭제하는 것이 기본 패턴이다.',
    'Kafka 소비는 at-least-once가 기본이다. 리스너는 반드시 멱등하게 만들고, 실패 메시지는 DefaultErrorHandler와 DLT로 다룬다.',
    'DB 트랜잭션과 Kafka 전송은 원자적으로 묶이지 않는다. 함께 보장해야 하면 트랜잭셔널 아웃박스를 쓴다.',
    '`@EventListener`는 기본이 동기·같은 트랜잭션이다. 커밋 후 처리는 `@TransactionalEventListener`, 별도 스레드는 `@Async`를 더한다.'
  ]
};
