(window.MINDMAP = window.MINDMAP || {})['spring-10'] = {
  name: 'Spring Batch',
  groups: [
    { name: '배치 기본 구조', items: [
      { t: 'Job', deep: false,
        d: '하나의 배치 작업 전체를 나타내는 최상위 단위로, 하나 이상의 Step을 순서나 조건에 따라 묶은 것이다.',
        how: [
          'Spring Batch 5부터 `JobBuilderFactory`, `StepBuilderFactory`는 deprecated되어 쓰지 않는다. `new JobBuilder(name, jobRepository)`처럼 JobRepository를 명시적으로 넘긴다.',
          '- `start(step).next(step)`: Step을 순서대로 실행한다.',
          '- `on("FAILED").to(step)`: Step의 ExitStatus에 따라 다른 Step으로 분기한다(Flow).',
          '- `incrementer(new RunIdIncrementer())`: 실행할 때마다 `run.id` 파라미터를 올려 새 JobInstance를 만든다.',
          '스프링 부트 3에서는 `@EnableBatchProcessing` 없이 자동 설정이 JobRepository, JobLauncher 등을 등록하고, 기동 시 Job을 실행한다.'
        ],
        code: `@Configuration
public class SettlementJobConfig {

    @Bean
    public Job settlementJob(JobRepository jobRepository, Step settlementStep) {
        return new JobBuilder("settlementJob", jobRepository)
                .start(settlementStep)
                .build();
    }
}`,
        warn: ['부트 3에서 `@EnableBatchProcessing`을 붙이면 배치 자동 설정이 물러나 기동 시 Job 실행, 스키마 초기화 같은 기능이 꺼진다. 직접 설정할 때만 붙인다.'],
        rel: ['Step', 'JobRepository', 'JobInstance · JobExecution'] },
      { t: 'Step', deep: false,
        d: 'Job을 구성하는 독립적인 처리 단계로, 실제 읽기·가공·쓰기 로직과 트랜잭션 경계를 가진다.',
        how: [
          '`new StepBuilder(name, jobRepository)`로 만들고, 트랜잭션 매니저도 명시적으로 넘긴다(Batch 5).',
          '- 청크 지향 Step: `chunk(size, transactionManager)`로 Reader·Processor·Writer를 조합한다.',
          '- Tasklet Step: `tasklet(tasklet, transactionManager)`로 단일 작업을 실행한다.',
          'Step 실행마다 StepExecution이 만들어져 읽은 건수, 쓴 건수, 커밋 횟수, 스킵 건수가 메타데이터 테이블에 기록된다.'
        ],
        rel: ['Job', '청크 지향 처리', 'Tasklet'] },
      { t: 'JobInstance · JobExecution', deep: true,
        d: 'JobInstance는 Job과 식별 파라미터 조합으로 구분되는 논리적 실행 단위이고, JobExecution은 그 JobInstance를 실제로 한 번 실행한 시도다.',
        why: '같은 날짜 정산을 두 번 돌리는 사고를 막고, 실패한 실행을 이어서 재시작하려면 "어떤 작업"과 "몇 번째 시도"를 구분해 기록해야 하기 때문이다.',
        how: [
          '`settlementJob` + `date=2024-01-01`이 하나의 JobInstance다. 날짜가 바뀌면 새 JobInstance가 된다.',
          '1) JobLauncher가 Job과 JobParameters를 받으면 JobRepository에서 같은 JobInstance가 있는지 조회한다.',
          '2) 없으면 새 JobInstance를 만들고, 있으면 마지막 JobExecution의 상태를 확인한다.',
          '3) 이전 실행이 COMPLETED면 `JobInstanceAlreadyCompleteException`, 아직 실행 중이면 `JobExecutionAlreadyRunningException`이 난다.',
          '4) FAILED·STOPPED면 같은 JobInstance 아래 새 JobExecution을 만들어 재시작한다.',
          '- BatchStatus: 프레임워크가 쓰는 실행 상태(STARTED, COMPLETED, FAILED 등).',
          '- ExitStatus: 실행 종료 코드로, Flow 분기 조건에 쓰고 사용자가 바꿀 수 있다.'
        ],
        code: `// 같은 파라미터로 두 번 실행하면
JobParameters params = new JobParametersBuilder()
        .addLocalDate("date", LocalDate.of(2024, 1, 1))
        .toJobParameters();

jobLauncher.run(settlementJob, params); // JobInstance #1, JobExecution #1 -> COMPLETED
jobLauncher.run(settlementJob, params); // JobInstanceAlreadyCompleteException

// 실패했다면 같은 파라미터로 다시 실행 -> JobInstance #1, JobExecution #2 (재시작)`,
        warn: ['`RunIdIncrementer`를 무심코 붙이면 매번 새 JobInstance가 만들어져 같은 날짜 데이터를 중복 처리하고, 실패 지점부터의 재시작도 되지 않는다.'],
        qa: ['JobInstance와 JobExecution의 차이는 무엇인가요?', 'JobInstance는 Job 이름과 식별 파라미터로 구분되는 논리적 작업이고, JobExecution은 그 작업을 실제로 실행한 한 번의 시도입니다. 하나의 JobInstance는 실패 후 재시작하면 여러 JobExecution을 가질 수 있지만, 성공한 JobInstance는 다시 실행할 수 없습니다. 이 구분 덕분에 중복 실행을 막고 실패한 작업을 이어서 재시작할 수 있습니다.'],
        rel: ['JobParameters', 'Batch 재시작', '중복 실행 방지', '메타데이터 테이블'] },
      { t: 'JobParameters', deep: false,
        d: 'Job 실행 시 외부에서 넘기는 파라미터 묶음으로, 식별 파라미터는 JobInstance를 구분하는 키가 된다.',
        how: [
          'Batch 5부터 `LocalDate`, `LocalDateTime` 등 임의 타입을 지원하며, 명령행에서는 `date=2024-01-01,java.time.LocalDate` 형식으로 넘긴다.',
          '- 식별 파라미터(identifying, 기본값): JobInstance 구분에 쓰인다.',
          '- 비식별 파라미터: `name=value,type,false`처럼 지정하며 JobInstance 구분에 쓰이지 않는다. 실행 옵션 전달에 쓴다.',
          '`@StepScope`, `@JobScope` 빈에서 `@Value("#{jobParameters[\'date\']}")`로 늦은 바인딩해 받는다.'
        ],
        code: `@Bean
@StepScope
public JdbcPagingItemReader<Order> orderReader(
        @Value("#{jobParameters['date']}") LocalDate date) {
    // 실행 시점에 넘어온 date로 조회 조건을 만든다
}`,
        warn: ['`@StepScope` 빈은 프록시로 만들어지므로 반환 타입을 `ItemReader`처럼 인터페이스로 두면 `ItemStream` 콜백(open, update)이 호출되지 않을 수 있다. 구현 클래스 타입으로 반환한다.'],
        rel: ['JobInstance · JobExecution', 'Jenkins 배치 실행'] },
      { t: 'JobRepository', deep: false,
        d: 'Job과 Step의 실행 정보(JobInstance, JobExecution, StepExecution, ExecutionContext)를 DB에 저장하고 조회하는 저장소다.',
        how: [
          '모든 Step 실행과 청크 커밋마다 상태를 갱신하므로, 서버가 죽어도 어디까지 처리했는지 남는다.',
          'Batch 5에서 Map 기반 인메모리 JobRepository는 제거되었다. 테스트에는 H2 같은 내장 DB를 쓴다(5.2부터는 메타데이터를 남기지 않는 `ResourcelessJobRepository`도 있다).',
          '새 JobExecution을 만들 때 기본 격리 수준을 SERIALIZABLE로 써서 여러 서버가 동시에 같은 JobInstance를 시작하지 못하게 한다.',
          '부트 3에서는 데이터소스와 트랜잭션 매니저를 이용해 자동 등록된다.'
        ],
        rel: ['메타데이터 테이블', '트랜잭션 매니저', '중복 실행 방지'] }
    ]},
    { name: '청크 처리', items: [
      { t: '청크 지향 처리', deep: true,
        d: '데이터를 한 건씩 읽고 가공한 뒤, 정해진 개수(청크)만큼 모아 한 번에 쓰고 커밋하는 Spring Batch의 기본 처리 방식이다.',
        why: '100만 건을 한 트랜잭션으로 처리하면 실패 시 전부 롤백되고 메모리도 부족해지며, 한 건씩 커밋하면 너무 느리다. 청크 단위로 커밋하면 실패 범위를 줄이면서 처리량도 확보할 수 있다.',
        how: [
          '1) 트랜잭션을 시작한다.',
          '2) ItemReader가 청크 크기만큼 한 건씩 읽는다. null을 반환하면 데이터 끝이다.',
          '3) ItemProcessor가 읽은 아이템을 한 건씩 가공하거나 걸러낸다.',
          '4) ItemWriter가 가공된 아이템 묶음(`Chunk`)을 한 번에 쓴다.',
          '5) 커밋하고 StepExecution의 읽기·쓰기 건수와 ExecutionContext(읽은 위치)를 저장한다. 데이터가 끝날 때까지 반복한다.',
          '청크 중간에 예외가 나면 그 청크만 롤백되고, 이전에 커밋된 청크는 유지된다.',
          '청크 크기는 보통 100~1000 사이에서 처리 시간과 메모리, 실패 시 재처리량을 보며 정한다. 페이징 Reader는 페이지 크기를 청크 크기와 맞춘다.'
        ],
        code: `@Bean
public Step settlementStep(JobRepository jobRepository,
                           PlatformTransactionManager transactionManager) {
    return new StepBuilder("settlementStep", jobRepository)
            .<Order, Settlement>chunk(500, transactionManager) // 500건마다 커밋
            .reader(orderReader(null))
            .processor(settlementProcessor())
            .writer(settlementWriter())
            .build();
}`,
        warn: [
          '청크 크기를 너무 크게 잡으면 실패 시 롤백량과 메모리 사용이 커지고, 너무 작게 잡으면 커밋과 메타데이터 갱신 비용이 커진다.',
          'Writer에서 한 건씩 저장 쿼리를 날리면 청크의 이점이 사라진다. 배치 INSERT(JDBC batch)로 묶어 쓴다.'
        ],
        qa: ['청크 지향 처리에서 트랜잭션은 어떻게 걸리나요?', '청크 하나가 하나의 트랜잭션입니다. 청크 크기만큼 읽고 가공한 뒤 Writer가 한 번에 쓰고 커밋하며, 이때 읽은 위치도 함께 저장됩니다. 중간에 실패하면 해당 청크만 롤백되고 이전 청크는 커밋된 상태로 남기 때문에, 재시작하면 마지막 커밋 지점부터 다시 처리할 수 있습니다.'],
        rel: ['ItemReader', 'ItemProcessor', 'ItemWriter', 'Tasklet', 'Batch 재시작'] },
      { t: 'ItemReader', deep: false,
        d: '파일, DB, API 등에서 데이터를 한 건씩 읽어 오는 인터페이스로, 더 읽을 데이터가 없으면 null을 반환한다.',
        how: [
          '- DB: `JdbcCursorItemReader`, `JdbcPagingItemReader`, `JpaPagingItemReader`, `JpaCursorItemReader`.',
          '- 파일: `FlatFileItemReader`(CSV), `JsonItemReader`, `StaxEventItemReader`(XML).',
          '대부분의 제공 Reader는 `ItemStream`도 구현해 `open`, `update`, `close`에서 읽은 위치를 ExecutionContext에 저장하고 복원한다. 이것이 재시작의 기반이다.',
          '직접 구현할 때도 재시작이 필요하면 `ItemStreamReader`를 구현해 위치를 저장한다.'
        ],
        rel: ['커서 기반 Reader', '페이징 기반 Reader', 'ExecutionContext'] },
      { t: 'ItemProcessor', deep: false,
        d: '읽은 아이템을 가공·검증·변환하는 단계로, null을 반환하면 그 아이템은 Writer로 넘어가지 않고 걸러진다.',
        how: [
          '입력 타입과 출력 타입이 달라도 되어 `Order`를 `Settlement`로 변환할 수 있다.',
          '걸러진 건수는 StepExecution의 `filterCount`로 기록된다.',
          '여러 처리를 나누려면 `CompositeItemProcessor`로 연결한다.',
          '선택 사항이라 가공이 필요 없으면 생략한다.'
        ],
        code: `@Bean
public ItemProcessor<Order, Settlement> settlementProcessor() {
    return order -> {
        if (order.isCanceled()) return null; // 필터링
        return Settlement.from(order);
    };
}`,
        warn: ['Processor 안에서 아이템마다 DB나 외부 API를 조회하면 N번의 호출이 생겨 느려진다. Reader에서 조인해 가져오거나 Writer에서 묶어 처리한다.'],
        rel: ['청크 지향 처리', 'ItemWriter'] },
      { t: 'ItemWriter', deep: false,
        d: '가공된 아이템을 청크 단위로 묶어 DB, 파일, 메시지 등으로 한 번에 내보내는 인터페이스다.',
        how: [
          'Batch 5부터 `write(Chunk<? extends T> chunk)`로 시그니처가 바뀌었다(이전에는 `List`).',
          '- `JdbcBatchItemWriter`: JDBC 배치 INSERT/UPDATE로 묶어서 써 가장 빠르다.',
          '- `JpaItemWriter`: EntityManager로 `merge`(또는 `persist`)한다.',
          '- `FlatFileItemWriter`: CSV 등 파일로 쓴다.',
          '- `CompositeItemWriter`, `ClassifierCompositeItemWriter`: 여러 대상에 쓰거나 아이템별로 Writer를 고른다.'
        ],
        warn: ['JPA에서 ID 생성 전략이 IDENTITY면 INSERT를 묶지 못해 한 건씩 실행된다. 대량 INSERT는 `JdbcBatchItemWriter`를 쓴다.'],
        rel: ['청크 지향 처리', 'JPA'] },
      { t: 'Tasklet', deep: false,
        d: '청크 구조 없이 Step 안에서 하나의 작업을 실행하는 단순한 처리 방식이다.',
        how: [
          '`execute()`가 `RepeatStatus.FINISHED`를 반환하면 끝나고, `CONTINUABLE`이면 다시 호출된다.',
          '`execute()` 한 번이 하나의 트랜잭션으로 실행된다.',
          '오래된 데이터 일괄 삭제, 파일 정리, 집계 프로시저 호출, 알림 발송처럼 읽기·쓰기 반복이 아닌 단일 작업에 쓴다.'
        ],
        code: `@Bean
public Step cleanupStep(JobRepository jobRepository, PlatformTransactionManager tm) {
    return new StepBuilder("cleanupStep", jobRepository)
            .tasklet((contribution, chunkContext) -> {
                logRepository.deleteOlderThan(LocalDate.now().minusDays(90));
                return RepeatStatus.FINISHED;
            }, tm)
            .build();
}`,
        warn: ['대량 데이터를 Tasklet 하나에서 반복문으로 처리하면 전체가 한 트랜잭션이 되어 실패 시 모두 롤백되고 재시작 지점도 없다. 대량 처리는 청크 지향으로 바꾼다.'],
        rel: ['청크 지향 처리', 'Step'] }
    ]},
    { name: '대용량 읽기', items: [
      { t: '커서 기반 Reader', deep: false,
        d: 'DB 커넥션 하나를 Step 내내 열어 두고 결과 집합을 스트리밍하듯 한 건씩 가져오는 Reader다.',
        how: [
          '`JdbcCursorItemReader`, `JpaCursorItemReader`(4.3+), `HibernateCursorItemReader`가 있다.',
          '쿼리를 한 번만 실행하고 `fetchSize`만큼씩 네트워크로 받아 오므로 페이징보다 빠르고, 데이터가 중간에 바뀌어도 누락이 생기지 않는다.',
          'MySQL은 기본적으로 결과를 모두 메모리에 올리므로 `useCursorFetch=true` 같은 드라이버 설정을 함께 써야 스트리밍된다.'
        ],
        warn: [
          'Step이 끝날 때까지 커넥션을 점유하므로 처리 시간이 길면 DB 타임아웃이나 커넥션 풀 고갈이 생길 수 있다.',
          '스레드 안전하지 않아 멀티스레드 Step에서는 `SynchronizedItemStreamReader`로 감싸야 한다.'
        ],
        rel: ['페이징 기반 Reader', '멀티스레드 Step'] },
      { t: '페이징 기반 Reader', deep: true,
        d: '정해진 페이지 크기만큼 쿼리를 나눠 실행하며 읽는 Reader로, 페이지마다 커넥션을 짧게 쓰고 반납한다.',
        why: '커서처럼 커넥션을 오래 잡지 않아 처리 시간이 긴 배치에서도 안정적이고, 스레드 안전해 멀티스레드 Step에 쓸 수 있기 때문이다.',
        how: [
          '1) 첫 페이지 쿼리를 실행해 pageSize만큼 가져와 메모리에 둔다.',
          '2) `read()`가 호출될 때마다 메모리에서 한 건씩 꺼낸다.',
          '3) 페이지를 다 쓰면 다음 페이지 쿼리를 실행한다. 결과가 비면 끝이다.',
          '- `JpaPagingItemReader`: OFFSET/LIMIT 방식이라 뒤 페이지로 갈수록 느려진다.',
          '- `JdbcPagingItemReader`: 정렬 키(`sortKeys`)를 기준으로 "마지막 키보다 큰 것"을 조회하는 방식이라 OFFSET 비용이 없다.',
          '정렬 기준은 반드시 고유한 컬럼(PK 등)이어야 페이지 경계에서 중복·누락이 생기지 않는다.'
        ],
        code: `@Bean
@StepScope
public JdbcPagingItemReader<Order> orderReader(DataSource dataSource,
        @Value("#{jobParameters['date']}") LocalDate date) {
    return new JdbcPagingItemReaderBuilder<Order>()
            .name("orderReader")
            .dataSource(dataSource)
            .selectClause("select id, amount, status")
            .fromClause("from orders")
            .whereClause("where order_date = :date")
            .parameterValues(Map.of("date", date))
            .sortKeys(Map.of("id", Order.ASCENDING)) // 고유 정렬 키 필수
            .pageSize(500)                           // 청크 크기와 맞춘다
            .rowMapper(new DataClassRowMapper<>(Order.class))
            .build();
}`,
        warn: ['조회 조건 컬럼을 Writer에서 바꾸면 다음 페이지의 OFFSET이 밀려 데이터가 누락된다(페이징 데이터 누락 문제).'],
        qa: ['커서 Reader와 페이징 Reader는 어떻게 골라 쓰나요?', '커서는 쿼리를 한 번만 실행해 빠르고 데이터 변경에 따른 누락이 없지만, Step 내내 커넥션을 잡고 있고 스레드 안전하지 않습니다. 페이징은 페이지마다 커넥션을 짧게 쓰고 스레드 안전해 오래 걸리는 배치나 멀티스레드 Step에 적합합니다. 다만 OFFSET 방식은 뒤로 갈수록 느려지고 데이터가 바뀌면 누락이 생길 수 있어, 정렬 키 기반의 JdbcPagingItemReader를 주로 씁니다.'],
        rel: ['커서 기반 Reader', '페이징 데이터 누락 문제', '청크 지향 처리'] },
      { t: '페이징 데이터 누락 문제', deep: false,
        d: 'OFFSET 기반 페이징으로 읽으면서 조회 조건에 쓰인 값을 수정하면, 다음 페이지 기준이 밀려 일부 데이터를 건너뛰는 문제다.',
        how: [
          '예를 들어 `status = READY`인 주문을 100건씩 읽어 `DONE`으로 바꾸면, 첫 페이지 100건이 조건에서 빠져 두 번째 쿼리의 `OFFSET 100`은 원래 201번째부터 읽게 된다. 결과적으로 절반 정도만 처리된다.',
          '- 정렬 키 기반 조회: `JdbcPagingItemReader`나 직접 만든 No-Offset Reader로 "마지막 id보다 큰 것"을 조회한다.',
          '- 항상 첫 페이지 읽기: 처리된 건이 조건에서 빠지는 구조라면 페이지 번호를 항상 0으로 고정한다.',
          '- 커서 Reader 사용: 쿼리를 한 번만 실행하므로 영향이 없다.',
          '- 조회 조건 분리: 처리 결과를 다른 테이블에 쓰거나 조건과 무관한 컬럼만 수정한다.'
        ],
        warn: ['테스트 데이터가 페이지 크기보다 적으면 문제가 드러나지 않는다. 페이지 크기보다 많은 데이터로 검증한다.'],
        rel: ['페이징 기반 Reader', '커서 기반 Reader'] }
    ]},
    { name: '실패 처리', items: [
      { t: 'Batch 스킵', deep: false,
        d: '특정 예외가 난 아이템을 건너뛰고 Step을 계속 진행하게 하는 내결함성(fault tolerant) 기능이다.',
        how: [
          '`.faultTolerant().skip(예외).skipLimit(n)`으로 설정하며, 스킵 건수가 한도를 넘으면 Step이 실패한다.',
          '- Reader·Processor에서 예외: 해당 아이템만 빼고 계속 진행한다.',
          '- Writer에서 예외: 어느 아이템이 문제인지 모르므로 청크를 롤백한 뒤 아이템을 한 건씩 다시 처리·쓰기(스캔)해 문제 아이템만 스킵한다.',
          '`SkipListener`로 스킵된 아이템을 별도 테이블이나 로그에 남겨 나중에 재처리한다.'
        ],
        code: `.<Order, Settlement>chunk(500, transactionManager)
.reader(reader).processor(processor).writer(writer)
.faultTolerant()
.skip(InvalidOrderException.class)
.skipLimit(100)
.listener(new FailedOrderSkipListener())`,
        warn: ['스킵된 데이터는 조용히 사라지기 쉽다. 반드시 SkipListener로 기록하고 모니터링한다.'],
        rel: ['Batch 재시도', 'Batch 리스너'] },
      { t: 'Batch 재시도', deep: false,
        d: '일시적인 오류(락 경합, 네트워크 타임아웃)가 난 아이템을 같은 청크 안에서 다시 시도하게 하는 내결함성 기능이다.',
        how: [
          '`.faultTolerant().retry(예외).retryLimit(n)`으로 설정하며, `backOffPolicy`로 재시도 간격을 줄 수 있다.',
          'Processor와 Writer에 적용되며 Reader의 예외는 재시도하지 않는다.',
          '재시도 한도를 넘으면 skip이 설정된 예외는 스킵하고, 아니면 Step이 실패한다.',
          '데드락, 낙관적 락 실패처럼 다시 하면 성공할 수 있는 예외에만 건다.'
        ],
        warn: ['검증 실패처럼 다시 해도 똑같이 실패하는 예외를 재시도하면 시간만 낭비한다. 이런 예외는 skip 대상이다.'],
        rel: ['Batch 스킵', 'Batch 재시작'] },
      { t: 'Batch 재시작', deep: true,
        d: '실패하거나 중지된 JobInstance를 같은 JobParameters로 다시 실행해, 이미 완료된 부분은 건너뛰고 실패 지점부터 이어서 처리하는 기능이다.',
        why: '수백만 건 중 마지막에 실패했을 때 처음부터 다시 돌리면 시간이 낭비되고, 이미 처리된 데이터를 중복 처리할 위험이 있기 때문이다.',
        how: [
          '1) 실패한 Job을 같은 식별 파라미터로 다시 실행하면 같은 JobInstance 아래 새 JobExecution이 만들어진다.',
          '2) 이전에 COMPLETED된 Step은 건너뛴다(`allowStartIfComplete(true)`면 다시 실행).',
          '3) 실패한 Step은 마지막 StepExecution의 ExecutionContext에서 읽은 위치(마지막 커밋 지점)를 복원한다.',
          '4) Reader가 그 위치부터 읽어 실패한 청크부터 다시 처리한다.',
          '- `preventRestart()`: 재시작을 막는다.',
          '- `startLimit(n)`: Step의 최대 실행 횟수를 제한한다.'
        ],
        code: `// 첫 실행: 3,000건까지 커밋 후 실패 -> FAILED
// 같은 파라미터로 재실행하면 3,001번째부터 처리
java -jar batch.jar --spring.batch.job.name=settlementJob date=2024-01-01,java.time.LocalDate

@Bean
public Step settlementStep(...) {
    return new StepBuilder("settlementStep", jobRepository)
            .<Order, Settlement>chunk(500, tm)
            .reader(orderReader(null))   // ItemStream이 읽은 위치를 저장
            .writer(settlementWriter())
            .startLimit(3)               // 최대 3번까지 실행
            .build();
}`,
        warn: [
          '프로세스를 강제 종료(kill -9)하면 JobExecution이 STARTED로 남아 재시작이 막힌다. 메타데이터의 상태를 FAILED로, 종료 시간을 채워 정리한 뒤 재실행한다.',
          '`saveState(false)`인 Reader나 멀티스레드 Step은 읽은 위치가 저장되지 않아 이어서 재시작할 수 없다. 처리 여부 플래그 등으로 멱등하게 만든다.'
        ],
        qa: ['Spring Batch는 어떻게 실패한 지점부터 재시작하나요?', '청크가 커밋될 때마다 Reader가 읽은 위치를 ExecutionContext에 저장하고, 이 정보가 JobRepository를 통해 메타데이터 테이블에 남습니다. 같은 파라미터로 다시 실행하면 같은 JobInstance로 인식해 완료된 Step은 건너뛰고, 실패한 Step은 저장된 위치를 복원해 마지막 커밋 이후부터 처리합니다.'],
        rel: ['ExecutionContext', 'JobInstance · JobExecution', '메타데이터 테이블'] },
      { t: 'ExecutionContext', deep: false,
        d: 'Job이나 Step 실행 중 상태를 키-값으로 저장해 재시작이나 Step 간 데이터 전달에 쓰는 저장소다.',
        how: [
          '- StepExecution의 ExecutionContext: Step 범위로, Reader의 읽은 위치 등이 청크 커밋마다 저장된다.',
          '- JobExecution의 ExecutionContext: Job 범위로, 여러 Step이 공유한다.',
          'Step에서 만든 값을 다음 Step에 넘기려면 `ExecutionContextPromotionListener`로 Job 범위로 올린다.',
          '직렬화되어 메타데이터 테이블에 저장된다.'
        ],
        warn: ['대량 데이터나 큰 객체를 넣으면 커밋마다 직렬화·저장 비용이 커진다. 위치나 ID 같은 작은 값만 넣는다.'],
        rel: ['Batch 재시작', '메타데이터 테이블'] }
    ]},
    { name: '확장', items: [
      { t: '멀티스레드 Step', deep: false,
        d: '하나의 Step에 TaskExecutor를 지정해 청크를 여러 스레드가 동시에 처리하게 하는 가장 간단한 병렬화 방식이다.',
        how: [
          '`.taskExecutor(executor)`만 추가하면 각 스레드가 청크 하나씩을 맡아 읽기·가공·쓰기를 한다.',
          'Reader, Processor, Writer가 모두 스레드 안전해야 한다. 페이징 Reader는 안전하고, 커서 Reader는 `SynchronizedItemStreamReader`로 감싼다.',
          'Batch 5에서 `throttleLimit`은 deprecated되었고, 동시성은 TaskExecutor의 스레드 풀 크기로 조절한다.'
        ],
        warn: ['여러 스레드가 섞여 읽으므로 처리 순서가 보장되지 않고, 읽은 위치를 정확히 저장할 수 없어 Reader에 `saveState(false)`를 준다. 재시작이 필요하면 파티셔닝을 쓴다.'],
        rel: ['Step 파티셔닝', '페이징 기반 Reader', '비동기 스레드 풀'] },
      { t: 'Step 파티셔닝', deep: true,
        d: '데이터를 범위별로 나누고(파티션), 파티션마다 독립된 Worker Step을 병렬로 실행하는 확장 방식이다.',
        why: '멀티스레드 Step은 Reader를 공유해 순서와 재시작이 보장되지 않는다. 파티셔닝은 각 Worker가 자기 범위만 읽고 자기 StepExecution을 가지므로 병렬로 빠르면서도 파티션별 재시작이 가능하다.',
        how: [
          '1) Manager Step의 `Partitioner`가 데이터를 나눌 기준(예: id 1~10만, 10만~20만)을 담은 ExecutionContext를 gridSize만큼 만든다.',
          '2) `PartitionHandler`(로컬은 `TaskExecutorPartitionHandler`)가 각 파티션을 Worker Step으로 실행한다.',
          '3) Worker Step은 `@StepScope`로 자기 파티션의 범위 값을 받아 그 범위만 읽고 쓴다.',
          '4) 모든 Worker가 끝나면 Manager가 결과를 모아 Step 상태를 정한다. 실패한 파티션만 재시작된다.',
          '원격 파티셔닝은 같은 구조에서 파티션 정보만 메시지로 다른 서버의 Worker에 보낸다.'
        ],
        code: `@Bean
public Step managerStep(JobRepository jobRepository, Step workerStep) {
    return new StepBuilder("managerStep", jobRepository)
            .partitioner("workerStep", new IdRangePartitioner(orderRepository))
            .step(workerStep)
            .gridSize(8)
            .taskExecutor(new SimpleAsyncTaskExecutor())
            .build();
}

@Bean
@StepScope
public JdbcPagingItemReader<Order> workerReader(
        @Value("#{stepExecutionContext['minId']}") Long minId,
        @Value("#{stepExecutionContext['maxId']}") Long maxId) {
    // where id between :minId and :maxId
}`,
        warn: ['id 범위로 단순 분할하면 중간에 삭제된 구간 때문에 파티션별 데이터 양이 크게 달라질 수 있다. 실제 분포를 보고 나눈다.'],
        qa: ['멀티스레드 Step과 파티셔닝의 차이는 무엇인가요?', '멀티스레드 Step은 하나의 Reader를 여러 스레드가 공유해 청크를 나눠 처리하므로 간단하지만, Reader가 스레드 안전해야 하고 읽은 위치를 저장할 수 없어 재시작이 어렵습니다. 파티셔닝은 데이터를 범위로 나눠 각 Worker Step이 자기 범위만 독립적으로 처리하고 각자 StepExecution을 가지므로, 실패한 파티션만 재시작할 수 있고 원격 서버로도 확장할 수 있습니다.'],
        rel: ['멀티스레드 Step', '원격 청킹', 'ExecutionContext'] },
      { t: '원격 청킹', deep: false,
        d: 'Manager가 데이터를 읽어 청크를 메시지로 보내고, 여러 서버의 Worker가 가공과 쓰기를 맡는 분산 처리 방식이다.',
        how: [
          'Spring Batch Integration(`@EnableBatchIntegration`)과 Kafka·RabbitMQ 같은 메시징 미들웨어로 구성한다.',
          '읽기는 빠르지만 가공·쓰기가 무거운 경우(복잡한 계산, 외부 호출)에 효과가 있다.',
          '아이템 데이터 자체가 네트워크로 오가므로 데이터가 크면 네트워크가 병목이 된다. 이때는 범위 정보만 보내는 원격 파티셔닝이 낫다.'
        ],
        rel: ['Step 파티셔닝'] }
    ]},
    { name: '운영', items: [
      { t: '스케줄러 연동 실행', deep: false,
        d: '애플리케이션 안의 스케줄러(`@Scheduled`, Quartz)가 정해진 시각에 JobLauncher로 Job을 실행하는 방식이다.',
        how: [
          '배치 애플리케이션이 계속 떠 있으면서 cron 표현식에 따라 `jobLauncher.run(job, params)`을 호출한다.',
          '실행 날짜나 시각을 JobParameters로 넘겨 실행마다 다른 JobInstance가 되게 한다.',
          '서버가 여러 대면 같은 시각에 모두 실행되므로 ShedLock 같은 분산 락이나 JobInstance 중복 검사로 한 번만 실행되게 한다.',
          'Batch 6(부트 4)에서는 `JobLauncher`가 deprecated되고 `JobOperator`로 실행하는 방식이 권장된다.'
        ],
        code: `@Scheduled(cron = "0 0 2 * * *")
public void runSettlement() throws Exception {
    JobParameters params = new JobParametersBuilder()
            .addLocalDate("date", LocalDate.now().minusDays(1))
            .toJobParameters();
    jobLauncher.run(settlementJob, params);
}`,
        warn: ['실행 이력, 실패 알림, 수동 재실행 화면을 직접 만들어야 한다. 배치가 많아지면 Jenkins 같은 외부 실행 도구가 관리에 유리하다.'],
        rel: ['@Scheduled', '분산 스케줄 락', 'Jenkins 배치 실행'] },
      { t: 'Jenkins 배치 실행', deep: false,
        d: 'Jenkins 같은 외부 도구가 배치 JAR를 Job 이름과 파라미터를 붙여 실행하고, 끝나면 프로세스가 종료되는 방식이다.',
        how: [
          '`java -jar batch.jar --spring.batch.job.name=settlementJob date=2024-01-01,java.time.LocalDate`처럼 실행한다. 부트 3은 Job이 여러 개면 `spring.batch.job.name`을 지정해야 한다.',
          'Jenkins의 cron 트리거, 실행 이력, 콘솔 로그, 실패 알림, 파라미터 입력 화면을 그대로 활용한다.',
          '`System.exit(SpringApplication.exit(SpringApplication.run(...)))`로 Job 실패를 0이 아닌 종료 코드로 돌려 Jenkins가 실패로 인식하게 한다.',
          '실행마다 새 JVM이 뜨므로 메모리 누수가 쌓이지 않고 배치별로 힙 크기를 다르게 줄 수 있다.'
        ],
        warn: ['종료 코드를 처리하지 않으면 Job이 실패해도 프로세스가 0으로 끝나 Jenkins에는 성공으로 표시된다.'],
        rel: ['스케줄러 연동 실행', 'JobParameters'] },
      { t: '중복 실행 방지', deep: false,
        d: '같은 배치가 동시에 또는 두 번 실행되어 데이터가 중복 처리되는 것을 막는 방법들이다.',
        how: [
          '- JobInstance 검사: 같은 식별 파라미터로 이미 COMPLETED면 `JobInstanceAlreadyCompleteException`, 실행 중이면 `JobExecutionAlreadyRunningException`이 난다.',
          '- 파라미터 설계: 처리 기준 날짜처럼 업무적으로 의미 있는 값을 식별 파라미터로 둔다. 실행 시각을 넣으면 매번 새 JobInstance가 되어 방지 효과가 사라진다.',
          '- 실행 단 제어: 스케줄러 분산 락, Jenkins의 동시 빌드 금지 옵션으로 실행 자체를 하나로 제한한다.',
          '- 멱등한 Writer: 처리 여부 플래그나 UPSERT로 다시 실행돼도 결과가 같게 만든다.'
        ],
        warn: ['`RunIdIncrementer`는 매 실행마다 새 JobInstance를 만들어 JobInstance 기반 중복 방지를 무력화한다.'],
        rel: ['JobInstance · JobExecution', '분산 스케줄 락', 'JobRepository'] },
      { t: '메타데이터 테이블', deep: false,
        d: 'JobRepository가 배치 실행 이력과 상태를 저장하는 `BATCH_` 접두사의 테이블들이다.',
        how: [
          '- `BATCH_JOB_INSTANCE`: Job 이름과 식별 파라미터 키.',
          '- `BATCH_JOB_EXECUTION`, `BATCH_JOB_EXECUTION_PARAMS`: 실행 시도별 상태, 시작·종료 시각, 파라미터.',
          '- `BATCH_STEP_EXECUTION`: Step별 읽기·쓰기·스킵·커밋 건수와 상태.',
          '- `BATCH_JOB_EXECUTION_CONTEXT`, `BATCH_STEP_EXECUTION_CONTEXT`: 직렬화된 ExecutionContext.',
          '스키마 스크립트는 spring-batch-core에 DB별로 들어 있고, 부트에서는 `spring.batch.jdbc.initialize-schema`(always, embedded, never)로 생성 여부를 정한다. 운영에서는 never로 두고 직접 만든다.'
        ],
        warn: ['이력이 계속 쌓여 테이블이 커지면 조회와 실행 생성이 느려진다. 오래된 이력을 주기적으로 정리한다.'],
        rel: ['JobRepository', 'ExecutionContext', 'Batch 재시작'] },
      { t: 'Batch 리스너', deep: false,
        d: 'Job, Step, 청크, 아이템 처리의 전후 시점에 끼어들어 로깅, 알림, 실패 기록 같은 부가 작업을 하는 콜백이다.',
        how: [
          '- `JobExecutionListener`: Job 시작·종료 시. 실패하면 메신저로 알림을 보낸다.',
          '- `StepExecutionListener`: Step 전후. `afterStep`에서 ExitStatus를 바꿔 Flow 분기에 쓴다.',
          '- `ChunkListener`: 청크 전후·에러 시.',
          '- `ItemReadListener`, `ItemProcessListener`, `ItemWriteListener`, `SkipListener`: 아이템 단위 이벤트.',
          '`@BeforeJob`, `@AfterStep` 같은 애너테이션으로도 등록할 수 있다.'
        ],
        rel: ['Batch 스킵', 'Job'] }
    ]}
  ],
  must: [
    'Spring Batch 5는 `JobBuilderFactory`·`StepBuilderFactory` 대신 `new JobBuilder(name, jobRepository)`, `chunk(size, transactionManager)`처럼 JobRepository와 트랜잭션 매니저를 명시한다.',
    'JobInstance는 Job + 식별 파라미터로 구분되며, 완료된 JobInstance는 다시 실행할 수 없고 실패한 것은 재시작된다.',
    '청크 하나가 하나의 트랜잭션이며, 커밋마다 읽은 위치가 저장되어 실패 지점부터 재시작할 수 있다.',
    'OFFSET 페이징 중 조회 조건 값을 바꾸면 데이터가 누락된다. 정렬 키 기반 페이징이나 커서 Reader를 쓴다.',
    '부트 3에서 `@EnableBatchProcessing`을 붙이면 배치 자동 설정이 꺼진다.'
  ]
};
