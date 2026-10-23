import type { Topic } from '../types';

const topic: Topic = {
  key: "spring-2",
  name: "AOP",
  must: [
    "AOP는 프록시를 거치는 외부 호출에만 적용된다. 내부 호출과 private 메서드는 대상이 아니다.",
    "final 클래스와 메서드는 CGLIB이 상속할 수 없다. Kotlin은 `allopen`(kotlin-spring) 플러그인이 필요하다.",
    "여러 Aspect의 실행 순서는 `@Order`로 정한다. 순서를 정하지 않으면 보장되지 않는다.",
    "빈의 `getClass()`를 찍으면 `$$SpringCGLIB$$`가 붙은 프록시 클래스가 보인다."
  ],
  groups: [
    {
      name: "횡단 관심사",
      concepts: [
        {
          id: "spring/hoengdan-gwansimsa",
          slug: "hoengdan-gwansimsa",
          title: "횡단 관심사",
          deep: false,
          def: "로깅, 트랜잭션, 보안처럼 여러 클래스에 공통으로 끼어드는 부가 기능이다.",
          why: "로깅, 트랜잭션 같은 공통 코드가 수많은 클래스에 흩어져 중복과 수정 비용이 커지는 것을 막기 위해서다.",
          how: [
            "애플리케이션 로직은 핵심 관심사(주문, 결제 같은 비즈니스 로직)와 횡단 관심사로 나눌 수 있다. 횡단 관심사는 여러 계층과 클래스에 같은 코드로 반복해서 나타난다.",
            "모든 서비스 메서드에 실행 시간 측정 코드를 넣으면 중복이 생기고, 측정 방식을 바꿀 때 수백 곳을 고쳐야 한다. AOP는 이 부가 기능을 한 모듈로 모으고 \"어디에 적용할지\"만 선언하게 한다.",
            "- 장점: 중복 제거, 핵심 로직의 가독성 향상, 부가 기능을 바꿀 때 한 곳만 수정",
            "- 스프링의 대표 사례: `@Transactional`, `@Cacheable`, `@Async`, 스프링 시큐리티의 `@PreAuthorize`"
          ],
          use: [
            "모든 서비스 메서드의 실행 시간을 측정하는 Aspect를 하나 만들어 느린 메서드를 찾는다.",
            "@Transactional로 서비스마다 반복되던 commit/rollback 코드를 없앤다."
          ],
          myth: [
            [
              "AOP는 로깅에만 쓰는 기술이다.",
              "스프링의 트랜잭션, 캐시, 비동기, 메서드 보안이 모두 AOP로 동작한다. 개발자가 직접 Aspect를 쓰지 않아도 이미 매일 쓰고 있다."
            ]
          ],
          answer: "횡단 관심사는 로깅, 트랜잭션, 보안처럼 여러 클래스에 반복해서 끼어드는 부가 기능입니다. 이를 핵심 비즈니스 로직과 섞어 두면 중복이 생기고 변경이 어렵기 때문에, AOP로 한 곳에 모아 관리합니다. 스프링의 @Transactional, @Cacheable이 대표적인 예입니다.",
          analogy: "건물의 전기 배선과 같습니다. 모든 방에 필요하지만 각 방 주인이 직접 깔지 않고, 설계 단계에서 한 번에 깔아 둡니다.",
          qa: [
            "AOP는 어떤 문제를 해결하나요?",
            "여러 클래스에 반복되는 로깅, 트랜잭션 같은 횡단 관심사를 핵심 로직에서 분리해 한 곳에 모읍니다. 부가 기능은 Aspect로 작성하고 적용 대상만 포인트컷으로 선언하므로 중복이 사라지고 핵심 로직은 비즈니스에만 집중할 수 있습니다."
          ],
          followUps: [
            [
              "AOP를 쓰지 않고 횡단 관심사를 처리하면 어떤 문제가 생기나요?",
              "같은 코드가 모든 메서드에 복사되어 중복이 생기고, 정책을 바꿀 때 모든 곳을 고쳐야 합니다. 또 핵심 로직과 부가 로직이 섞여 코드를 읽기 어려워집니다."
            ]
          ],
          related: ["spring/aspect", "spring/pointcut", "spring/around"]
        }
      ]
    },
    {
      name: "AOP 용어",
      compare: {
        cols: ["개념", "한 줄 정의", "예시"],
        rows: [
          ["Aspect", "Advice + Pointcut 모듈", "`@Aspect` 로깅 클래스"],
          ["Advice", "부가 기능 코드와 실행 시점", "`@Around`, `@Before`"],
          ["JoinPoint", "Advice 적용 가능 지점", "스프링에선 메서드 실행만"],
          ["Pointcut", "적용 대상 선택 표현식", "`execution(* *..*Service.*(..))`"],
          ["Target", "프록시가 감싼 원본 객체", "실제 `OrderService` 빈"],
          ["Advisor", "Pointcut 1개 + Advice 1개", "트랜잭션 Advisor"],
          ["Weaving", "Advice를 대상에 적용", "스프링은 런타임 프록시 생성"]
        ]
      },
      concepts: [
        {
          id: "spring/aspect",
          slug: "aspect",
          title: "Aspect",
          deep: false,
          def: "부가 기능(Advice)과 적용 대상(Pointcut)을 하나로 묶은 모듈이다.",
          why: "흩어진 부가 기능과 그 적용 대상을 한 모듈로 모아 한곳에서 관리하고 바꾸기 위해서다.",
          how: [
            "스프링에서는 클래스에 `@Aspect`를 붙이고 스프링 빈으로 등록해(`@Component`) 만든다. 클래스 안의 각 메서드가 Advice가 되고, 메서드에 붙은 포인트컷 표현식이 적용 대상을 정한다.",
            "- 하나의 Aspect 안에 여러 Advice와 Pointcut을 둘 수 있다.",
            "- 스프링 내부에서는 Aspect가 여러 개의 Advisor(Pointcut 1 + Advice 1)로 변환되어 프록시 생성에 쓰인다.",
            "- 여러 Aspect가 같은 대상에 적용되면 `@Order`로 순서를 정한다."
          ],
          code: "@Aspect\n@Component\npublic class TimeTraceAspect {\n    @Around(\"execution(* com.shop..*Service.*(..))\")\n    public Object trace(ProceedingJoinPoint pjp) throws Throwable {\n        long start = System.currentTimeMillis();\n        try {\n            return pjp.proceed();\n        } finally {\n            log.info(\"{} {}ms\", pjp.getSignature(), System.currentTimeMillis() - start);\n        }\n    }\n}",
          codeLang: "java",
          use: ["@Aspect + @Component 클래스로 특정 애너테이션이 붙은 API의 호출 로그를 남긴다.", "외부 API 호출 메서드에 재시도 Aspect를 적용한다."],
          myth: [
            [
              "@Aspect만 붙이면 자동으로 동작한다.",
              "@Aspect는 컴포넌트 스캔 대상이 아니다. @Component를 함께 붙이거나 @Bean으로 등록해야 빈이 되어 적용된다."
            ]
          ],
          answer: "Aspect는 부가 기능인 Advice와 적용 대상인 Pointcut을 묶은 모듈입니다. 스프링에서는 클래스에 @Aspect를 붙이고 빈으로 등록하면 되고, 내부적으로는 Advisor 여러 개로 바뀌어 프록시 생성에 쓰입니다.",
          analogy: "\"무엇을(Advice) 어디에(Pointcut) 붙일지\" 적어 둔 작업 지시서입니다.",
          followUps: [
            [
              "Aspect와 Advisor는 어떻게 다른가요?",
              "Aspect는 여러 Advice와 Pointcut을 담을 수 있는 개발자용 모듈이고, Advisor는 Pointcut 하나와 Advice 하나를 묶은 스프링 내부 단위입니다. 스프링은 @Aspect 클래스를 읽어 Advisor 목록으로 변환합니다."
            ]
          ],
          related: ["spring/advice", "spring/pointcut", "spring/advisor"]
        },
        {
          id: "spring/advice",
          slug: "advice",
          title: "Advice",
          deep: false,
          def: "실제로 실행될 부가 기능 코드와 그 실행 시점을 말한다.",
          why: "부가 기능의 내용과 실행 시점을 분리해 선언해야 핵심 로직을 건드리지 않고 기능을 끼워 넣을 수 있기 때문이다.",
          how: [
            "Advice는 \"무엇을 할지\"와 \"언제 할지\"를 함께 정의한다. 스프링은 실행 시점에 따라 `@Before`, `@AfterReturning`, `@AfterThrowing`, `@After`, `@Around` 다섯 가지를 제공한다.",
            "- 스프링 AOP의 Advice는 메서드 실행 전후에만 끼어들 수 있다.",
            "- Advice 메서드는 `JoinPoint`(또는 `@Around`의 `ProceedingJoinPoint`)를 파라미터로 받아 대상 메서드 이름, 인자, 대상 객체 정보를 얻을 수 있다.",
            "- 스프링 내부에서는 Advice가 MethodInterceptor로 바뀌어 프록시의 인터셉터 체인에 들어간다."
          ],
          use: ["메서드 실행 전 권한을 확인하는 @Before Advice를 만든다.", "예외 발생 시 슬랙으로 알리는 @AfterThrowing Advice를 만든다."],
          answer: "Advice는 실제로 실행될 부가 기능 코드와 그 실행 시점을 정의한 것입니다. 스프링은 실행 시점에 따라 @Before, @AfterReturning, @AfterThrowing, @After, @Around 다섯 가지를 제공하며, 내부적으로는 MethodInterceptor로 바뀌어 프록시의 인터셉터 체인에서 실행됩니다.",
          followUps: [
            [
              "Advice는 어떤 정보를 받을 수 있나요?",
              "JoinPoint 파라미터로 메서드 시그니처, 인자, 원본 객체, 프록시 객체를 얻을 수 있습니다. @AfterReturning은 반환값, @AfterThrowing은 예외를 추가로 받고, @Around는 ProceedingJoinPoint로 실행 자체를 제어합니다."
            ]
          ],
          related: ["spring/around", "spring/before", "spring/aspect"]
        },
        {
          id: "spring/joinpoint",
          slug: "joinpoint",
          title: "JoinPoint",
          deep: false,
          def: "Advice를 적용할 수 있는 실행 지점이다. 스프링 AOP에서는 메서드 실행만 해당한다.",
          why: "스프링 AOP가 메서드 실행에만 적용된다는 한계를 알아야 생성자나 필드 접근에 기대한 부가 기능이 동작하지 않는 이유를 이해할 수 있기 때문이다.",
          how: [
            "이론적으로 JoinPoint는 메서드 호출, 생성자 호출, 필드 접근, static 초기화 등 프로그램 실행 중의 여러 지점이 될 수 있다. AspectJ는 이 지점들을 모두 지원한다.",
            "스프링 AOP는 프록시를 통해 동작하므로 프록시가 가로챌 수 있는 \"스프링 빈의 메서드 실행\"만 JoinPoint가 된다.",
            "- Advice 메서드의 파라미터 `JoinPoint`로 현재 지점 정보를 꺼낸다: `getSignature()`(메서드 시그니처), `getArgs()`(인자), `getTarget()`(원본 객체), `getThis()`(프록시 객체).",
            "- `@Around`에서는 실행을 제어할 수 있는 `ProceedingJoinPoint`를 받는다."
          ],
          use: ["Advice 안에서 joinPoint.getArgs()로 요청 인자를 꺼내 감사 로그에 남긴다."],
          myth: [
            [
              "스프링 AOP로 필드 값이 바뀌는 시점에도 끼어들 수 있다.",
              "스프링 AOP의 JoinPoint는 메서드 실행뿐이다. 필드 접근이나 생성자에 적용하려면 AspectJ 위빙이 필요하다."
            ]
          ],
          answer: "JoinPoint는 Advice를 적용할 수 있는 실행 지점입니다. AspectJ는 생성자 호출이나 필드 접근까지 지원하지만, 스프링 AOP는 프록시 방식이라 스프링 빈의 메서드 실행만 JoinPoint가 됩니다.",
          analogy: "기차 노선의 모든 정차 가능 역입니다. 그중 실제로 멈출 역을 고르는 것이 Pointcut입니다.",
          followUps: [
            [
              "getTarget()과 getThis()의 차이는 무엇인가요?",
              "getTarget()은 프록시가 감싸고 있는 원본 객체를, getThis()는 프록시 객체 자신을 반환합니다. 스프링 AOP에서는 두 객체가 다릅니다."
            ]
          ],
          related: ["spring/pointcut", "spring/spring-aop", "spring/aspectj"]
        },
        {
          id: "spring/pointcut",
          slug: "pointcut",
          title: "Pointcut",
          deep: false,
          def: "JoinPoint 중에서 Advice를 실제로 적용할 곳을 고르는 표현식이다.",
          why: "부가 기능을 모든 메서드가 아니라 원하는 곳에만 정확히 적용하기 위해서다.",
          how: [
            "스프링은 AspectJ의 포인트컷 표현식 문법을 그대로 쓴다.",
            "- `execution(* com.shop.order..*Service.*(..))`: 패키지·클래스·메서드 이름 패턴으로 선택. 가장 많이 쓴다.",
            "- `within(com.shop..*)`: 특정 패키지나 타입 안의 모든 메서드",
            "- `@annotation(com.shop.LogTime)`: 해당 애너테이션이 붙은 메서드",
            "- `@within(...)`, `bean(orderService)`, `args(..)` 등도 있다.",
            "`@Pointcut`으로 이름 붙인 포인트컷을 만들어 여러 Advice에서 재사용하고 `&&`, `||`, `!`로 조합할 수 있다. 애너테이션 기반 포인트컷은 적용 대상이 코드에 드러나 실무에서 선호된다."
          ],
          code: "@Pointcut(\"execution(* com.shop..*Service.*(..))\")\nprivate void allService() {}\n\n@Before(\"allService() && @annotation(com.shop.LogTime)\")\npublic void log(JoinPoint jp) {\n    log.info(\"call {}\", jp.getSignature());\n}",
          codeLang: "java",
          use: [
            "execution(* com.shop..*Service.*(..))로 모든 서비스 메서드에 실행 시간 측정을 건다.",
            "@annotation(LogTime)으로 원하는 메서드에만 골라서 적용한다."
          ],
          answer: "Pointcut은 JoinPoint 중 Advice를 실제로 적용할 곳을 고르는 표현식입니다. 스프링은 AspectJ 포인트컷 문법을 쓰며, 패키지·메서드 패턴으로 고르는 execution과 애너테이션으로 고르는 @annotation을 가장 많이 씁니다.",
          analogy: "택배 분류기의 주소 필터입니다. 조건에 맞는 상자에만 스티커(Advice)를 붙입니다.",
          followUps: [
            [
              "execution 방식과 @annotation 방식 중 무엇을 선호하나요?",
              "@annotation 방식은 적용 대상이 코드에 명시적으로 드러나 의도를 알기 쉽고, 실수로 넓은 범위에 적용되는 일이 적어 선호됩니다. 공통 정책을 넓게 적용할 때는 execution 패턴을 씁니다."
            ]
          ],
          related: ["spring/joinpoint", "spring/aspect", "spring/advisor"]
        },
        {
          id: "spring/target",
          slug: "target",
          title: "Target",
          deep: false,
          def: "Advice가 적용되는 원본 객체, 즉 프록시가 감싸고 있는 실제 빈이다.",
          why: "컨테이너에 등록되고 주입되는 것은 원본이 아니라 프록시라는 점을 알아야 내부 호출 같은 함정을 이해할 수 있기 때문이다.",
          how: [
            "프록시는 요청을 받으면 Advice를 실행한 뒤 Target의 실제 메서드를 호출한다. 컨테이너에는 Target 대신 프록시가 빈으로 등록되므로, 다른 빈이 주입받는 것은 프록시다.",
            "- Advice 안에서 `joinPoint.getTarget()`으로 원본 객체를, `getThis()`로 프록시 객체를 얻을 수 있다.",
            "- Target 내부에서 `this`로 자기 메서드를 부르면 프록시를 거치지 않는다. 이것이 셀프 호출 문제의 원인이다."
          ],
          use: ["디버깅 시 주입받은 빈의 클래스 이름에 $$SpringCGLIB$$가 붙어 있으면 Target이 프록시로 감싸져 있음을 알 수 있다."],
          answer: "Target은 Advice가 적용되는 원본 객체, 즉 프록시가 감싸고 있는 실제 빈입니다. 컨테이너에는 Target 대신 프록시가 등록되어 다른 빈이 주입받는 것은 프록시이고, 프록시가 Advice를 실행한 뒤 Target의 메서드를 호출합니다.",
          analogy: "연예인(Target)과 매니저(프록시)의 관계입니다. 외부 연락은 매니저를 거쳐야 일정 관리가 됩니다.",
          followUps: [
            [
              "Target 안에서 this로 메서드를 부르면 어떻게 되나요?",
              "this는 프록시가 아닌 Target 자신을 가리키므로 프록시를 거치지 않고, 그 메서드에 걸린 AOP가 적용되지 않습니다. 이것이 셀프 호출 문제입니다."
            ]
          ],
          related: ["spring/selpeu-hochul-munje", "spring/cglib-peuroksi"]
        },
        {
          id: "spring/advisor",
          slug: "advisor",
          title: "Advisor",
          deep: false,
          def: "Pointcut 하나와 Advice 하나를 묶은 것으로, 스프링 AOP 내부에서 쓰는 단위다.",
          why: "`@Aspect`가 내부에서 어떻게 프록시 적용 대상으로 바뀌는지 알아야 트랜잭션, 캐시 같은 스프링 기능의 동작 원리를 설명할 수 있기 때문이다.",
          how: [
            "`@Aspect` 클래스는 개발 편의를 위한 표현이고, 스프링은 이를 읽어 Advisor 목록으로 바꾼다(BeanFactoryAspectJAdvisorsBuilder).",
            "자동 프록시 생성기(AnnotationAwareAspectJAutoProxyCreator)는 빈이 만들어질 때 모든 Advisor의 Pointcut을 그 빈에 대조해 보고, 하나라도 맞으면 프록시를 만들어 맞는 Advisor들을 적용한다.",
            "- 하나의 빈에 여러 Advisor가 맞아도 프록시는 하나만 만들어지고, 그 안에 Advisor들이 체인으로 들어간다.",
            "- `@Transactional`도 내부적으로 BeanFactoryTransactionAttributeSourceAdvisor라는 Advisor로 동작한다."
          ],
          use: ["@Transactional도 BeanFactoryTransactionAttributeSourceAdvisor라는 Advisor로 등록되어 동작한다."],
          myth: [["Advisor가 여러 개 맞으면 프록시도 여러 겹 만들어진다.", "빈 하나에는 프록시가 하나만 만들어지고, 맞는 Advisor들이 그 안에 인터셉터 체인으로 들어간다."]],
          answer: "Advisor는 Pointcut 하나와 Advice 하나를 묶은 스프링 AOP의 내부 단위입니다. 자동 프록시 생성기가 빈마다 모든 Advisor의 Pointcut을 대조해 보고, 맞는 것이 있으면 프록시를 하나 만들어 해당 Advisor들을 체인으로 적용합니다.",
          followUps: [
            [
              "자동 프록시 생성기는 언제 동작하나요?",
              "BeanPostProcessor의 초기화 후 단계에서 동작합니다. 빈이 만들어지고 초기화까지 끝난 뒤, 적용할 Advisor가 있으면 원본 대신 프록시를 컨테이너에 등록합니다."
            ]
          ],
          related: ["spring/aspect", "spring/pointcut", "spring/weaving"]
        },
        {
          id: "spring/weaving",
          slug: "weaving",
          title: "Weaving",
          deep: false,
          def: "Advice를 Target에 실제로 적용해 부가 기능이 동작하게 만드는 과정이다.",
          why: "위빙 시점에 따라 적용 범위와 성능, 설정 부담이 달라지므로 스프링 AOP와 AspectJ 중 무엇을 쓸지 판단하기 위해서다.",
          how: [
            "위빙 시점은 세 가지다.",
            "- 컴파일 타임 위빙: AspectJ 컴파일러(ajc)가 컴파일할 때 바이트코드에 Advice를 삽입한다.",
            "- 로드 타임 위빙(LTW): 클래스 로더가 클래스를 JVM에 올릴 때 자바 에이전트가 바이트코드를 수정한다.",
            "- 런타임 위빙: 애플리케이션 실행 중에 프록시 객체를 만들어 원본 대신 사용한다. 스프링 AOP의 방식이다.",
            "런타임 위빙은 별도 컴파일러나 JVM 옵션이 필요 없어 간단하지만, 프록시가 가로챌 수 있는 메서드 실행에만 적용된다."
          ],
          flow: ["빈 생성 및 초기화", "BeanPostProcessor 호출", "맞는 Advisor 탐색", "프록시 객체 생성", "원본 대신 프록시 등록"],
          use: ["일반 프로젝트는 런타임 위빙(스프링 AOP)만으로 충분하고, 특수한 경우에만 AspectJ LTW를 켠다."],
          answer: "Weaving은 Advice를 Target에 실제로 적용하는 과정입니다. 컴파일 타임, 클래스 로드 타임, 런타임 세 시점이 있고, 스프링 AOP는 실행 중에 프록시를 만드는 런타임 위빙을 씁니다.",
          analogy: "옷감(핵심 로직)에 무늬 실(부가 기능)을 짜 넣는 과정입니다. 옷을 만들 때 짜 넣을 수도(컴파일), 입기 직전에 덧댈 수도(런타임) 있습니다.",
          followUps: [
            [
              "런타임 위빙의 한계는 무엇인가요?",
              "프록시가 가로챌 수 있는 외부 메서드 호출에만 적용되어, 내부 호출, private·final 메서드, 생성자에는 적용되지 않습니다."
            ]
          ],
          related: ["spring/spring-aop", "spring/aspectj", "spring/beanpostprocessor"]
        }
      ]
    },
    {
      name: "Advice 종류",
      compare: {
        cols: ["기준", "@Before", "@AfterReturning", "@AfterThrowing", "@After", "@Around"],
        rows: [
          ["실행 시점", "메서드 실행 전", "정상 반환 후", "예외 발생 후", "항상(finally)", "실행 전후 모두"],
          ["대상 실행 제어", "불가(예외로만 차단)", "불가", "불가", "불가", "proceed()로 직접 제어"],
          ["받을 수 있는 정보", "인자", "반환값", "예외", "없음", "인자·반환값·예외"],
          ["값 바꾸기", "불가", "반환값 교체 불가", "예외 교체 불가", "불가", "인자·반환값·예외 교체"],
          ["대표 용도", "권한·파라미터 검증", "결과 로그", "장애 알림", "리소스 정리", "시간 측정, 재시도"]
        ]
      },
      concepts: [
        {
          id: "spring/before",
          slug: "before",
          title: "@Before",
          deep: false,
          def: "대상 메서드가 실행되기 전에 실행되는 Advice다.",
          why: "대상 메서드 실행 전에 검증이나 권한 확인처럼 앞단 처리만 필요할 때 실행 흐름을 신경 쓰지 않고 간단히 끼워 넣기 위해서다.",
          how: [
            "Advice가 끝나면 대상 메서드가 자동으로 실행된다. 대상 실행을 막으려면 예외를 던지는 방법밖에 없다.",
            "- 쓰임: 파라미터 검증, 권한 확인, 호출 로그",
            "- `JoinPoint`로 인자를 읽을 수 있지만 인자를 바꿔 넘길 수는 없다. 인자를 바꾸려면 `@Around`를 쓴다."
          ],
          code: "@Before(\"@annotation(com.shop.AdminOnly)\")\npublic void checkAdmin(JoinPoint jp) {\n    if (!currentUser.isAdmin()) throw new AccessDeniedException(\"관리자 전용\");\n}",
          codeLang: "java",
          use: ["@AdminOnly 애너테이션이 붙은 메서드 실행 전에 관리자 권한을 확인한다."],
          myth: [
            [
              "@Before에서 인자를 바꿔 대상 메서드에 넘길 수 있다.",
              "@Before는 인자를 읽을 수만 있다. 인자를 바꾸려면 @Around에서 proceed(newArgs)를 호출해야 한다."
            ]
          ],
          answer: "@Before는 대상 메서드가 실행되기 전에 실행되는 Advice입니다. Advice가 끝나면 대상 메서드가 자동으로 실행되며, 실행을 막으려면 예외를 던져야 합니다. 권한 확인이나 파라미터 검증에 주로 씁니다.",
          followUps: [
            [
              "@Before에서 대상 메서드 실행을 막으려면 어떻게 하나요?",
              "예외를 던지면 대상 메서드가 실행되지 않고 예외가 호출자에게 전파됩니다. 예외 없이 실행 여부를 제어하려면 @Around를 써야 합니다."
            ]
          ],
          related: ["spring/around", "spring/advice"]
        },
        {
          id: "spring/afterreturning",
          slug: "afterreturning",
          title: "@AfterReturning",
          deep: false,
          def: "대상 메서드가 예외 없이 정상 반환한 뒤 실행되는 Advice다.",
          why: "정상 결과가 나온 경우에만 결과 로그나 후속 알림 같은 처리를 하기 위해서다.",
          how: [
            "`returning` 속성으로 반환값을 파라미터로 받을 수 있다. 반환값의 타입이 파라미터 타입과 맞지 않으면 Advice가 실행되지 않는다.",
            "- 쓰임: 결과 로그, 결과 기반 후처리(알림 발송 등)",
            "- 반환 객체의 내부 상태는 바꿀 수 있지만 반환값 자체를 다른 객체로 바꿀 수는 없다. 바꾸려면 `@Around`를 쓴다."
          ],
          code: "@AfterReturning(pointcut = \"allService()\", returning = \"result\")\npublic void logResult(JoinPoint jp, Object result) {\n    log.info(\"{} -> {}\", jp.getSignature().getName(), result);\n}",
          codeLang: "java",
          use: ["주문 생성 메서드가 성공적으로 반환되면 반환된 주문 번호를 로그로 남긴다."],
          myth: [
            [
              "@AfterReturning에서 반환값을 다른 객체로 바꿀 수 있다.",
              "반환 객체의 내부 상태는 바꿀 수 있지만 반환값 자체를 교체할 수는 없다. 교체하려면 @Around를 쓴다."
            ]
          ],
          answer: "@AfterReturning은 대상 메서드가 예외 없이 정상 반환한 뒤 실행되는 Advice입니다. returning 속성으로 반환값을 받을 수 있어 결과 로그나 후속 처리에 씁니다.",
          followUps: [
            [
              "returning 파라미터 타입이 반환 타입과 다르면 어떻게 되나요?",
              "반환값이 그 타입에 할당될 수 없으면 Advice가 실행되지 않습니다. 모든 반환값을 받으려면 Object로 선언합니다."
            ]
          ],
          related: ["spring/afterthrowing", "spring/after"]
        },
        {
          id: "spring/afterthrowing",
          slug: "afterthrowing",
          title: "@AfterThrowing",
          deep: false,
          def: "대상 메서드가 예외를 던졌을 때 실행되는 Advice다.",
          why: "예외가 났을 때만 예외 로그나 장애 알림을 남기는 코드를 핵심 로직에서 분리하기 위해서다.",
          how: [
            "`throwing` 속성으로 발생한 예외를 파라미터로 받는다. 파라미터 타입에 맞는 예외일 때만 실행된다.",
            "- 쓰임: 예외 로그, 장애 알림, 예외 통계",
            "- Advice가 끝나면 예외는 그대로 호출자에게 전파된다. 예외를 삼키거나 다른 예외로 바꾸려면 `@Around`에서 try-catch를 쓴다."
          ],
          code: "@AfterThrowing(pointcut = \"allService()\", throwing = \"ex\")\npublic void alert(JoinPoint jp, RuntimeException ex) {\n    slack.send(jp.getSignature() + \" 실패: \" + ex.getMessage());\n}",
          codeLang: "java",
          use: ["결제 서비스에서 예외가 나면 장애 채널로 알림을 보낸다."],
          myth: [["@AfterThrowing으로 예외를 처리하면 예외가 사라진다.", "예외는 그대로 전파된다. 예외를 삼키거나 바꾸려면 @Around에서 try-catch를 써야 한다."]],
          answer: "@AfterThrowing은 대상 메서드가 예외를 던졌을 때 실행되는 Advice입니다. throwing 속성으로 예외를 받아 로그나 알림에 쓰며, Advice가 끝나면 예외는 그대로 호출자에게 전파됩니다.",
          followUps: [
            [
              "@AfterThrowing과 @ExceptionHandler는 어떻게 다른가요?",
              "@AfterThrowing은 AOP로 메서드 단위 예외를 관찰만 하고 예외를 그대로 전파합니다. @ExceptionHandler는 웹 계층에서 예외를 잡아 HTTP 응답으로 바꾸는 역할입니다."
            ]
          ],
          related: ["spring/afterreturning", "spring/around"]
        },
        {
          id: "spring/after",
          slug: "after",
          title: "@After",
          deep: false,
          def: "정상 반환이든 예외든 상관없이 대상 메서드가 끝나면 항상 실행되는 Advice다.",
          why: "성공이든 실패든 반드시 해야 하는 자원 정리나 ThreadLocal 정리를 빠뜨리지 않기 위해서다.",
          how: [
            "자바의 finally 블록과 같은 역할이다. 반환값이나 예외 정보는 받을 수 없다.",
            "- 쓰임: 리소스 정리, ThreadLocal 정리, 실행 종료 로그",
            "- 같은 Aspect 안에서 `@AfterReturning`이나 `@AfterThrowing`보다 나중에 실행된다."
          ],
          use: ["Advice가 설정한 MDC 값이나 ThreadLocal을 메서드 종료 후 항상 지운다."],
          answer: "@After는 정상 반환이든 예외든 대상 메서드가 끝나면 항상 실행되는 Advice로, 자바의 finally와 같습니다. 반환값이나 예외 정보는 받을 수 없어 리소스 정리나 종료 로그에 씁니다.",
          analogy: "퇴근할 때 무조건 끄는 사무실 불과 같습니다. 일이 잘 끝났든 문제가 생겼든 마지막에 항상 합니다.",
          followUps: [
            [
              "@After와 @AfterReturning이 같은 Aspect에 있으면 실행 순서는?",
              "@AfterReturning(또는 @AfterThrowing)이 먼저 실행되고 @After가 나중에 실행됩니다."
            ]
          ],
          related: ["spring/afterreturning", "spring/afterthrowing"]
        },
        {
          id: "spring/around",
          slug: "around",
          title: "@Around",
          deep: false,
          def: "대상 메서드 실행 전후를 모두 감싸고, 실행 여부까지 직접 제어하는 가장 강력한 Advice다.",
          why: "캐시, 재시도, 실행 시간 측정처럼 대상 실행 여부와 전후 흐름을 직접 제어해야 하는 기능을 구현하기 위해서다.",
          how: [
            "파라미터로 `ProceedingJoinPoint`를 받고, `proceed()`를 호출해야 대상 메서드가 실행된다. 그래서 다른 Advice로는 할 수 없는 일이 가능하다.",
            "- 실행하지 않기(캐시 히트 시 바로 반환), 여러 번 실행하기(재시도)",
            "- 인자 바꾸기: `proceed(newArgs)`",
            "- 반환값 바꾸기, 예외를 잡아 다른 예외로 바꾸기",
            "- 실행 시간 측정처럼 전후 정보가 모두 필요한 작업",
            "같은 Aspect 안에서의 실행 순서는 Around 시작 → Before → 대상 → AfterReturning/AfterThrowing → After → Around 종료다."
          ],
          flow: ["Around 시작 코드 실행", "proceed() 호출", "Before·대상 메서드 실행", "반환값 또는 예외 수신", "Around 종료 코드 실행", "결과 반환"],
          code: "@Around(\"@annotation(com.shop.Retry)\")\npublic Object retry(ProceedingJoinPoint pjp) throws Throwable {\n    for (int i = 1; ; i++) {\n        try {\n            return pjp.proceed();\n        } catch (TransientException e) {\n            if (i == 3) throw e;\n        }\n    }\n}",
          codeLang: "java",
          use: ["외부 API 호출에 일시적 오류가 나면 최대 3번 재시도한다.", "메서드 실행 시간을 측정해 임계값을 넘으면 경고 로그를 남긴다."],
          warn: [
            "`proceed()` 호출을 빠뜨리면 대상 메서드가 아예 실행되지 않는다.",
            "반환값을 돌려주지 않으면(`void`로 선언하는 등) 호출자가 null을 받는다.",
            "필요한 기능만 쓰는 좁은 Advice(`@Before` 등)로 충분하면 그쪽을 쓰는 것이 의도가 명확하고 실수가 적다."
          ],
          myth: [
            [
              "@Around는 반환 타입을 void로 해도 된다.",
              "void로 하면 대상의 반환값이 버려져 호출자가 null을 받는다. 반드시 Object를 반환하고 proceed()의 결과를 돌려줘야 한다."
            ]
          ],
          answer: "@Around는 대상 메서드의 실행 전후를 모두 감싸는 가장 강력한 Advice입니다. ProceedingJoinPoint의 proceed()를 직접 호출해야 대상이 실행되므로 실행 여부, 인자, 반환값, 예외까지 제어할 수 있습니다. 실행 시간 측정, 재시도, 캐시에 주로 씁니다.",
          analogy: "문 앞에 선 경비원입니다. 들여보낼지, 몇 번 들여보낼지, 나올 때 무엇을 들려 보낼지까지 정합니다.",
          followUps: [
            [
              "@Around로 다 되는데 왜 다른 Advice를 쓰나요?",
              "@Around는 proceed() 호출을 빠뜨리거나 반환값을 버리는 실수가 생기기 쉽습니다. 실행 전 검증만 필요하면 @Before처럼 필요한 기능만 가진 Advice를 써야 의도가 분명하고 안전합니다."
            ],
            [
              "proceed()를 두 번 호출하면 어떻게 되나요?",
              "대상 메서드가 두 번 실행됩니다. 재시도 로직이 이 원리를 이용하지만, 의도하지 않으면 중복 저장 같은 버그가 됩니다."
            ]
          ],
          related: ["spring/before", "spring/advice", "spring/aspect-silhaeng-sunseo"]
        }
      ]
    },
    {
      name: "프록시 방식",
      compare: {
        cols: ["기준", "JDK 동적 프록시", "CGLIB 프록시"],
        rows: [
          ["생성 방식", "인터페이스 구현", "대상 클래스 상속"],
          ["인터페이스 필요", "필요", "불필요"],
          ["구체 클래스 타입 주입", "불가(타입 불일치)", "가능"],
          ["적용 불가 대상", "인터페이스에 없는 메서드", "final 클래스·메서드"],
          ["스프링 부트 기본", "아님(설정 필요)", "기본값(2.0부터)"]
        ]
      },
      concepts: [
        {
          id: "spring/jdk-dongjeok-peuroksi",
          slug: "jdk-dongjeok-peuroksi",
          title: "JDK 동적 프록시",
          deep: true,
          def: "대상이 구현한 인터페이스를 똑같이 구현하는 프록시를 런타임에 만드는 자바 기본 기능이다.",
          why: "스프링 AOP는 원본 객체 대신 프록시를 빈으로 등록해야 부가 기능을 끼워 넣을 수 있다. 인터페이스 기반으로 프록시를 만드는 표준 방법이 JDK 동적 프록시다.",
          how: [
            "`java.lang.reflect.Proxy.newProxyInstance()`에 인터페이스 목록과 `InvocationHandler`를 넘기면, JVM이 그 인터페이스를 구현한 클래스(`$Proxy12` 같은 이름)를 런타임에 만든다.",
            "1) 클라이언트가 프록시의 인터페이스 메서드를 호출한다.",
            "2) 프록시는 모든 호출을 `InvocationHandler.invoke(proxy, method, args)`로 넘긴다.",
            "3) 핸들러가 부가 기능을 실행하고 `method.invoke(target, args)`로 원본 메서드를 호출한다.",
            "- 프록시는 인터페이스를 구현할 뿐 원본 클래스와는 상속 관계가 없다.",
            "- 그래서 구체 클래스 타입(`OrderServiceImpl`)으로 주입받으면 타입이 맞지 않아 `BeanNotOfRequiredTypeException`이 난다.",
            "- 스프링 부트는 2.0부터 기본으로 CGLIB을 쓰므로, `spring.aop.proxy-target-class=false`로 설정해야 인터페이스가 있는 빈에 JDK 동적 프록시가 쓰인다."
          ],
          flow: [
            "인터페이스 목록 전달",
            "Proxy가 구현 클래스 생성",
            "클라이언트가 메서드 호출",
            "InvocationHandler.invoke",
            "부가 기능 실행",
            "method.invoke로 원본 호출"
          ],
          code: "OrderService proxy = (OrderService) Proxy.newProxyInstance(\n    OrderService.class.getClassLoader(),\n    new Class<?>[]{OrderService.class},\n    (p, method, args) -> {\n        long start = System.nanoTime();\n        try {\n            return method.invoke(target, args);\n        } finally {\n            log.info(\"{} {}ns\", method.getName(), System.nanoTime() - start);\n        }\n    });",
          codeLang: "java",
          use: [
            "스프링 데이터 JPA의 Repository 인터페이스 구현체가 JDK 동적 프록시로 만들어진다.",
            "proxy-target-class=false로 설정해 인터페이스 기반 프록시를 강제할 수 있다."
          ],
          warn: [
            "인터페이스가 없는 클래스에는 쓸 수 없다.",
            "인터페이스에 선언되지 않은 public 메서드는 프록시를 통해 호출할 수 없어 AOP가 적용되지 않는다.",
            "리플렉션 호출이라 아주 약간의 오버헤드가 있지만 실무 성능에 영향을 줄 정도는 아니다."
          ],
          myth: [
            [
              "스프링은 인터페이스가 있으면 항상 JDK 동적 프록시를 쓴다.",
              "스프링 프레임워크 기본값은 그렇지만, 스프링 부트는 2.0부터 proxy-target-class=true가 기본이라 인터페이스가 있어도 CGLIB을 쓴다."
            ]
          ],
          answer: "JDK 동적 프록시는 자바의 Proxy 클래스로 대상이 구현한 인터페이스를 똑같이 구현하는 프록시를 런타임에 만드는 방식입니다. 모든 호출이 InvocationHandler로 모여 부가 기능을 실행한 뒤 원본 메서드를 리플렉션으로 호출합니다. 인터페이스가 꼭 필요하고, 구체 클래스 타입으로는 주입받을 수 없다는 한계가 있습니다.",
          analogy: "같은 자격증(인터페이스)을 가진 대리인입니다. 자격증에 적힌 업무만 대신할 수 있고, 본인(구체 클래스)인 척은 못 합니다.",
          qa: [
            "JDK 동적 프록시와 CGLIB의 차이는 무엇인가요?",
            "JDK 동적 프록시는 대상의 인터페이스를 구현해 프록시를 만들기 때문에 인터페이스가 반드시 필요하고, 구체 클래스 타입으로는 주입받을 수 없습니다. CGLIB은 대상 클래스를 상속해 프록시를 만들어 인터페이스가 없어도 되지만 final 클래스나 메서드는 프록시할 수 없습니다. 스프링 부트는 타입 문제를 피하려고 기본으로 CGLIB을 씁니다."
          ],
          followUps: [
            [
              "구체 클래스 타입으로 주입받으면 왜 실패하나요?",
              "JDK 동적 프록시는 인터페이스만 구현할 뿐 원본 클래스를 상속하지 않습니다. 그래서 프록시 객체는 OrderServiceImpl 타입이 아니고, 그 타입으로 주입하면 BeanNotOfRequiredTypeException이 발생합니다."
            ],
            [
              "InvocationHandler는 어떤 역할을 하나요?",
              "프록시의 모든 메서드 호출을 받는 단일 진입점입니다. 호출된 Method와 인자를 받아 부가 기능을 실행하고 원본 객체의 메서드를 리플렉션으로 호출합니다."
            ],
            [
              "인터페이스에 없는 메서드에 AOP가 걸리나요?",
              "걸리지 않습니다. 프록시가 인터페이스 메서드만 구현하므로 인터페이스에 선언되지 않은 public 메서드는 프록시를 통해 호출할 수 없습니다."
            ]
          ],
          related: ["spring/cglib-peuroksi", "spring/target", "spring/spring-aop"]
        },
        {
          id: "spring/cglib-peuroksi",
          slug: "cglib-peuroksi",
          title: "CGLIB 프록시",
          deep: true,
          def: "바이트코드를 생성해 대상 클래스를 상속한 자식 클래스를 프록시로 만드는 방식이다.",
          why: "인터페이스가 없는 클래스에도 AOP를 적용하고, 구체 클래스 타입으로 주입받아도 문제가 없게 하려면 상속 기반 프록시가 필요하다. 스프링 부트의 기본 프록시 방식이다.",
          how: [
            "CGLIB(Code Generator Library)은 런타임에 `OrderService$$SpringCGLIB$$0` 같은 하위 클래스를 만들고, 오버라이드 가능한 메서드를 모두 재정의해 `MethodInterceptor`로 넘긴다. 스프링은 CGLIB을 `spring-core` 안에 재패키징해 포함하고 있다.",
            "1) 컨테이너가 원본 빈을 만든다.",
            "2) 초기화 후 단계에서 자동 프록시 생성기(BeanPostProcessor)가 적용할 Advisor가 있는지 확인한다.",
            "3) 있으면 원본 클래스를 상속한 프록시 객체를 만들어 원본 대신 컨테이너에 등록한다.",
            "4) 프록시의 메서드가 호출되면 인터셉터 체인(Advice들)을 실행한 뒤 원본 객체의 메서드를 호출한다.",
            "- 스프링 부트 2.0부터 `spring.aop.proxy-target-class=true`가 기본값이라 인터페이스가 있어도 CGLIB을 쓴다.",
            "- 예전에는 기본 생성자가 필요하고 생성자가 두 번 호출되는 문제가 있었지만, 스프링 4부터 Objenesis로 생성자 호출 없이 프록시 인스턴스를 만들어 해결되었다.",
            "- `@Configuration` 클래스도 같은 방식으로 프록시되어 `@Bean` 메서드의 싱글톤을 보장한다."
          ],
          flow: ["원본 빈 생성", "초기화 후 BPP 실행", "적용할 Advisor 확인", "하위 클래스 생성", "Objenesis로 인스턴스화", "원본 대신 프록시 등록"],
          code: "@Service\npublic class OrderService {          // 인터페이스 없음\n    @Transactional\n    public void order(Long id) { ... }\n}\n\n// 주입받는 것은 프록시\n@Autowired OrderService orderService;\norderService.getClass();\n// class com.shop.OrderService$$SpringCGLIB$$0",
          codeLang: "java",
          use: [
            "인터페이스 없이 만든 서비스 클래스에도 @Transactional이 적용되는 이유가 CGLIB 프록시다.",
            "Kotlin 프로젝트에서 kotlin-spring 플러그인으로 클래스를 open해 프록시를 가능하게 한다."
          ],
          warn: [
            "final 클래스는 상속할 수 없어 프록시가 만들어지지 않고, final 메서드는 오버라이드할 수 없어 AOP가 적용되지 않는다.",
            "Kotlin 클래스는 기본이 final이라 `kotlin-spring`(allopen) 플러그인이 필요하다.",
            "private 메서드는 오버라이드할 수 없어 적용되지 않는다. 스프링 6부터 protected·package-private 메서드에는 적용된다.",
            "프록시 내부에서 원본의 다른 메서드를 부르는 셀프 호출에는 적용되지 않는다."
          ],
          myth: [
            [
              "CGLIB 프록시를 만들 때 원본 생성자가 두 번 호출된다.",
              "스프링 4부터 Objenesis를 써서 프록시 인스턴스는 생성자 호출 없이 만들어진다. 예전 버전의 문제다."
            ],
            [
              "CGLIB은 public 메서드에만 적용된다.",
              "스프링 6부터 CGLIB 프록시는 protected와 package-private 메서드에도 적용된다. private과 final만 불가능하다."
            ]
          ],
          answer: "CGLIB 프록시는 바이트코드를 생성해 대상 클래스를 상속한 자식 클래스를 프록시로 만드는 방식입니다. 인터페이스가 없어도 되고 구체 클래스 타입으로 주입받아도 문제가 없어, 스프링 부트 2.0부터 기본 프록시 방식이 되었습니다. 대신 상속 기반이라 final 클래스와 final·private 메서드에는 적용되지 않습니다.",
          analogy: "부모 가게를 물려받은 자녀 가게입니다. 간판(타입)은 그대로 쓰면서 손님을 받을 때마다 부가 서비스를 끼워 넣습니다. 다만 부모가 \"변경 금지(final)\"로 정한 메뉴는 손댈 수 없습니다.",
          qa: [
            "스프링 부트는 왜 기본으로 CGLIB을 쓰나요?",
            "JDK 동적 프록시는 인터페이스를 구현할 뿐이라 구체 클래스 타입으로 주입받으면 타입 불일치 오류가 납니다. CGLIB은 대상 클래스를 상속하므로 어떤 타입으로 주입받아도 문제가 없고, 예전의 기본 생성자 문제도 Objenesis로 해결되어 단점이 줄었기 때문에 부트 2.0부터 기본값이 되었습니다. 대신 final 클래스와 메서드에는 적용되지 않는다는 점을 주의해야 합니다."
          ],
          followUps: [
            [
              "final 메서드에 @Transactional을 붙이면 어떻게 되나요?",
              "오버라이드할 수 없어 프록시가 그 메서드를 가로채지 못하므로 트랜잭션이 적용되지 않습니다. 오류 없이 조용히 무시되기 때문에 더 위험합니다."
            ],
            [
              "CGLIB 프록시가 어떻게 원본 메서드를 호출하나요?",
              "프록시는 오버라이드한 메서드에서 MethodInterceptor를 통해 인터셉터 체인(Advice)을 실행한 뒤, 컨테이너가 만든 원본 객체(Target)의 메서드를 호출합니다. 프록시 자신의 super 메서드가 아니라 별도의 원본 객체를 호출합니다."
            ],
            [
              "@Configuration 클래스의 CGLIB 프록시는 무엇을 하나요?",
              "@Bean 메서드를 오버라이드해 호출될 때 컨테이너에 이미 빈이 있으면 그 빈을 돌려줍니다. 그래서 @Bean 메서드를 여러 번 호출해도 싱글톤이 유지됩니다."
            ]
          ],
          related: [
            "spring/jdk-dongjeok-peuroksi",
            "spring/selpeu-hochul-munje",
            "spring/beanpostprocessor",
            "spring/configuration-peuroksi"
          ]
        }
      ]
    },
    {
      name: "AOP 구현 방식",
      compare: {
        cols: ["기준", "Spring AOP", "AspectJ"],
        rows: [
          ["위빙 시점", "런타임(프록시 생성)", "컴파일·로드 타임"],
          ["적용 대상", "스프링 빈의 메서드 실행", "생성자·필드·static 등 전부"],
          ["내부 호출 적용", "안 됨", "됨"],
          ["설정 난이도", "쉬움(스타터 추가)", "컴파일러·에이전트 필요"]
        ]
      },
      concepts: [
        {
          id: "spring/spring-aop",
          slug: "spring-aop",
          title: "Spring AOP",
          deep: false,
          def: "런타임에 프록시를 만들어 스프링 빈의 메서드 실행에 부가 기능을 적용하는 스프링의 AOP 구현이다.",
          why: "별도 컴파일러나 에이전트 없이 트랜잭션, 캐시 같은 대부분의 실무 부가 기능을 간단하게 적용하기 위해서다.",
          how: [
            "빈이 생성될 때 BeanPostProcessor가 프록시로 바꿔치기하고, 프록시를 통해 들어오는 호출에만 Advice가 적용된다.",
            "- 장점: 별도 컴파일러나 JVM 에이전트가 필요 없고 설정이 간단하다. 트랜잭션, 캐시, 로깅 같은 대부분의 실무 요구를 충족한다.",
            "- 한계: 스프링 빈에만, 메서드 실행에만 적용된다. 셀프 호출, private 메서드, final 메서드, 생성자, 필드 접근에는 적용되지 않는다.",
            "- AspectJ의 애너테이션(`@Aspect`, `@Before` 등)과 포인트컷 문법만 빌려 쓰고 실제 위빙은 자체 프록시로 한다. `spring-boot-starter-aop` 의존성으로 활성화된다."
          ],
          use: ["spring-boot-starter-aop를 추가하고 @Aspect 빈을 등록하는 것만으로 공통 로깅을 적용한다."],
          myth: [
            [
              "스프링 AOP는 AspectJ를 내부에서 실행한다.",
              "스프링은 AspectJ의 애너테이션과 포인트컷 문법만 빌려 쓰고, 위빙은 자체 프록시로 한다. aspectjweaver 라이브러리는 표현식 해석에 쓰인다."
            ]
          ],
          answer: "Spring AOP는 런타임에 프록시를 만들어 스프링 빈의 메서드 실행에 부가 기능을 적용하는 스프링의 AOP 구현입니다. 별도 컴파일러가 필요 없어 간단하고 대부분의 실무 요구를 충족하지만, 프록시를 거치는 외부 호출에만 적용된다는 한계가 있습니다.",
          followUps: [
            [
              "스프링 AOP가 적용되지 않는 경우는 언제인가요?",
              "같은 클래스 안의 내부 호출, private·final 메서드, 스프링 빈이 아닌 객체, 생성자나 필드 접근에는 적용되지 않습니다. 모두 프록시가 호출을 가로챌 수 없는 경우입니다."
            ]
          ],
          related: ["spring/aspectj", "spring/weaving", "spring/cglib-peuroksi"]
        },
        {
          id: "spring/aspectj",
          slug: "aspectj",
          title: "AspectJ",
          deep: false,
          def: "바이트코드 자체를 수정해 부가 기능을 넣는 완전한 AOP 프레임워크다.",
          why: "프록시로는 닿지 않는 내부 호출, private 메서드, 스프링 빈이 아닌 객체까지 부가 기능을 적용해야 할 때를 대비하기 위해서다.",
          how: [
            "컴파일 시점(ajc 컴파일러)이나 클래스 로드 시점(LTW, `-javaagent`)에 클래스 파일을 직접 바꾼다. 프록시가 없으므로 객체 내부 호출에도 적용된다.",
            "- 적용 범위: 생성자, 필드 읽기·쓰기, static 메서드, private 메서드, 같은 클래스 안의 호출, 스프링 빈이 아닌 객체까지",
            "- 단점: 빌드 설정이나 JVM 옵션이 필요해 복잡하고, 바이트코드가 바뀌어 디버깅이 어려울 수 있다.",
            "- 스프링에서는 `@EnableLoadTimeWeaving`이나 `@Transactional(mode = AdviceMode.ASPECTJ)`처럼 꼭 필요한 경우에만 쓴다."
          ],
          use: ["셀프 호출에도 트랜잭션이 걸려야 하는 특수한 레거시 구조에서 @Transactional(mode = AdviceMode.ASPECTJ)와 LTW를 사용한다."],
          answer: "AspectJ는 컴파일 시점이나 클래스 로드 시점에 바이트코드 자체를 수정하는 완전한 AOP 프레임워크입니다. 프록시가 없으므로 내부 호출, private 메서드, 생성자, 필드 접근까지 적용되지만, 컴파일러나 자바 에이전트 설정이 필요해 복잡합니다.",
          analogy: "건물을 지을 때 벽 안에 배관을 넣는 방식입니다. 어디든 닿지만 공사(빌드 설정)가 커집니다.",
          followUps: [
            [
              "AspectJ를 써야 하는 경우는 언제인가요?",
              "스프링 빈이 아닌 객체나 내부 호출, 생성자, 필드 접근에 부가 기능이 꼭 필요할 때입니다. 대부분은 설계를 바꿔(별도 빈 분리) 스프링 AOP로 해결하는 편이 낫습니다."
            ]
          ],
          related: ["spring/spring-aop", "spring/weaving", "spring/joinpoint"]
        }
      ]
    },
    {
      name: "AOP 주의점",
      compare: {
        cols: ["기준", "셀프 호출 문제", "Aspect 실행 순서"],
        rows: [
          ["발생 상황", "내부에서 `this.method()` 호출", "한 메서드에 Aspect 여러 개"],
          ["원인", "프록시를 거치지 않음", "순서 미지정 시 보장 없음"],
          ["증상", "`@Transactional` 미적용", "트랜잭션·로깅 순서 꼬임"],
          ["해결", "별도 빈으로 분리", "`@Order`로 우선순위 지정"]
        ]
      },
      concepts: [
        {
          id: "spring/selpeu-hochul-munje",
          slug: "selpeu-hochul-munje",
          title: "셀프 호출 문제",
          deep: true,
          def: "같은 클래스 안에서 `this`로 메서드를 호출하면 프록시를 거치지 않아 AOP가 적용되지 않는 문제다.",
          why: "`@Transactional`, `@Async`, `@Cacheable`이 \"붙어 있는데 동작하지 않는\" 대표 원인이다. 프록시 구조를 이해하지 못하면 데이터 정합성 버그로 이어진다.",
          how: [
            "컨테이너에는 프록시가 등록되어 있고, 프록시가 원본(Target)을 감싸고 있다.",
            "1) 컨트롤러가 `orderService.external()`을 호출하면 프록시가 받는다.",
            "2) `external()`에는 Advice가 없으므로 프록시는 바로 원본의 `external()`을 호출한다.",
            "3) 원본 안에서 `this.internal()`을 부른다. 여기서 `this`는 프록시가 아니라 원본 객체다.",
            "4) 원본의 `internal()`이 바로 실행되어 `@Transactional`이 붙어 있어도 트랜잭션이 시작되지 않는다.",
            "해결 방법은 다음과 같다.",
            "- 별도 빈으로 분리(가장 권장): `internal()`을 다른 클래스로 옮겨 주입받아 호출한다. 외부 호출이 되므로 프록시를 거친다.",
            "- 자기 자신을 지연 주입: `ObjectProvider<OrderService>`로 프록시를 받아 호출한다. 구조가 어색해 권장하지 않는다.",
            "- `AopContext.currentProxy()`: `@EnableAspectJAutoProxy(exposeProxy = true)`가 필요하고 코드가 AOP에 묶인다.",
            "- AspectJ 위빙: 바이트코드를 바꾸므로 내부 호출에도 적용되지만 설정이 복잡하다."
          ],
          flow: [
            "외부가 external() 호출",
            "프록시가 Advice 없이 위임",
            "원본 external() 실행",
            "this.internal() 호출",
            "원본 internal() 직접 실행",
            "트랜잭션 미적용"
          ],
          code: "@Service\npublic class OrderService {\n    public void external() {\n        internal();               // this.internal() → 프록시를 거치지 않음\n    }\n    @Transactional\n    public void internal() { ... } // 트랜잭션 시작 안 됨\n}\n\n// 해결: 별도 빈으로 분리\n@Service\n@RequiredArgsConstructor\npublic class OrderFacade {\n    private final OrderWriter writer; // writer.internal()은 프록시를 거친다\n}",
          codeLang: "java",
          use: [
            "주문 처리 중 이력 저장을 REQUIRES_NEW로 분리하려면 이력 저장 메서드를 별도 OrderHistoryWriter 빈으로 옮긴다.",
            "@Async 메서드를 같은 클래스에서 불러 동기로 실행되던 버그를 별도 빈 분리로 고친다."
          ],
          warn: [
            "`@Async` 메서드를 같은 클래스에서 부르면 비동기가 아니라 동기로 실행된다.",
            "`@Cacheable` 메서드를 내부에서 부르면 캐시를 거치지 않고 매번 실행된다.",
            "테스트에서 서비스를 직접 호출하면 정상 동작해 보여도, 실제 호출 경로가 내부 호출이면 운영에서만 문제가 드러날 수 있다."
          ],
          myth: [
            ["public 메서드로 바꾸면 내부 호출에도 적용된다.", "접근 제어자와 무관하다. 내부 호출은 프록시를 거치지 않으므로 public이어도 적용되지 않는다."],
            [
              "테스트에서 잘 되면 운영에서도 된다.",
              "테스트가 internal()을 외부에서 직접 호출하면 프록시를 거쳐 정상으로 보인다. 실제 경로가 내부 호출이면 운영에서만 문제가 드러난다."
            ]
          ],
          answer: "셀프 호출 문제는 같은 클래스 안에서 this로 메서드를 부르면 프록시를 거치지 않아 @Transactional 같은 AOP가 적용되지 않는 문제입니다. 컨테이너에 등록된 것은 프록시지만, 원본 객체 안의 this는 프록시가 아니라 원본 자신이기 때문입니다. 해당 메서드를 별도 빈으로 분리해 외부 호출로 만드는 것이 가장 권장되는 해결책입니다.",
          analogy: "매니저를 통해야 일정이 기록되는데, 연예인이 직접 자기 일정을 잡으면 매니저 장부에 남지 않는 것과 같습니다.",
          qa: [
            "같은 클래스의 @Transactional 메서드를 호출하면 왜 트랜잭션이 적용되지 않나요?",
            "스프링 AOP는 프록시 기반이라 외부에서 프록시를 통해 들어온 호출에만 Advice가 적용됩니다. 같은 클래스 안에서 호출하면 this, 즉 원본 객체의 메서드를 바로 부르므로 프록시의 트랜잭션 인터셉터가 실행되지 않습니다. 그래서 해당 메서드를 별도 빈으로 분리해 외부 호출이 되도록 하는 방법을 가장 많이 씁니다."
          ],
          followUps: [
            [
              "자기 자신을 주입받아 호출하면 해결되나요?",
              "자기 자신의 프록시를 주입받아 호출하면 프록시를 거치므로 동작합니다. 다만 생성자 주입으로는 순환 참조가 되어 ObjectProvider로 지연 조회해야 하고 구조가 어색해 권장하지 않습니다."
            ],
            [
              "외부 메서드에도 @Transactional을 붙이면 어떻게 되나요?",
              "외부 호출 시점에 트랜잭션이 시작되고 내부 메서드는 같은 스레드에서 실행되므로 그 트랜잭션 안에서 동작합니다. 다만 내부 메서드에 지정한 전파 속성(REQUIRES_NEW 등)은 여전히 적용되지 않습니다."
            ],
            [
              "@Async와 @Cacheable에도 같은 문제가 있나요?",
              "네, 모두 프록시 기반이라 같은 클래스 내부 호출에는 적용되지 않습니다. @Async는 동기로 실행되고 @Cacheable은 캐시를 거치지 않습니다."
            ]
          ],
          related: ["spring/cglib-peuroksi", "spring/target", "spring/aspectj", "spring/transactional-dongjak-wonri"]
        },
        {
          id: "spring/aspect-silhaeng-sunseo",
          slug: "aspect-silhaeng-sunseo",
          title: "Aspect 실행 순서",
          deep: false,
          def: "하나의 메서드에 여러 Aspect가 적용될 때 어느 Aspect가 먼저 실행될지 정하는 규칙이다.",
          why: "트랜잭션과 재시도처럼 감싸는 순서에 따라 결과가 달라지는 Aspect를 의도한 순서대로 실행하기 위해서다.",
          how: [
            "순서를 지정하지 않으면 실행 순서가 보장되지 않는다. Aspect 클래스에 `@Order(1)`처럼 지정하거나 `Ordered` 인터페이스를 구현한다. 숫자가 작을수록 바깥쪽(먼저 시작, 나중에 끝남)에서 실행된다.",
            "- `@Order`는 클래스 단위로만 적용된다. 같은 Aspect 안의 Advice끼리 순서를 정하고 싶으면 Aspect를 나눈다.",
            "- 트랜잭션(`@EnableTransactionManagement(order = ...)`)과 커스텀 Aspect의 순서가 중요할 때가 있다. 예: 재시도 Aspect가 트랜잭션보다 바깥에 있어야 재시도마다 새 트랜잭션이 열린다."
          ],
          code: "@Aspect @Order(1) @Component\npublic class RetryAspect { ... }       // 바깥: 재시도마다\n\n@Aspect @Order(2) @Component\npublic class LogAspect { ... }         // 안쪽",
          codeLang: "java",
          use: ["재시도 Aspect를 트랜잭션보다 바깥(@Order 작은 값)에 두어 재시도할 때마다 새 트랜잭션이 열리게 한다."],
          myth: [["@Order는 Advice 메서드에 붙여도 순서가 정해진다.", "@Order는 Aspect 클래스 단위로만 적용된다. 메서드에 붙이면 의미가 없다."]],
          answer: "여러 Aspect가 같은 메서드에 적용되면 순서를 지정하지 않는 한 실행 순서가 보장되지 않습니다. Aspect 클래스에 @Order를 붙이면 숫자가 작은 Aspect가 바깥에서 먼저 시작하고 나중에 끝납니다. 같은 Aspect 안의 Advice끼리는 @Order로 순서를 정할 수 없어 Aspect를 나눠야 합니다.",
          analogy: "양파 껍질과 같습니다. 숫자가 작을수록 바깥 껍질이라 들어갈 때 먼저, 나올 때 나중에 지나갑니다.",
          followUps: [
            [
              "재시도 Aspect가 트랜잭션 안쪽에 있으면 어떤 문제가 생기나요?",
              "첫 시도에서 예외가 나면 트랜잭션이 이미 rollback-only로 표시되어, 재시도가 성공해도 커밋 시점에 실패할 수 있습니다. 그래서 재시도는 트랜잭션 바깥에서 감싸야 합니다."
            ]
          ],
          related: ["spring/aspect", "spring/around"]
        }
      ]
    }
  ]
};

export default topic;
