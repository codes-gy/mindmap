import type { Topic } from '../types';

const topic: Topic = {
  key: "spring-10",
  name: "Spring Batch",
  must: [
    "Spring Batch 5는 `JobBuilderFactory`·`StepBuilderFactory` 대신 `new JobBuilder(name, jobRepository)`, `chunk(size, transactionManager)`처럼 JobRepository와 트랜잭션 매니저를 명시한다.",
    "JobInstance는 Job + 식별 파라미터로 구분되며, 완료된 JobInstance는 다시 실행할 수 없고 실패한 것은 재시작된다.",
    "청크 하나가 하나의 트랜잭션이며, 커밋마다 읽은 위치가 저장되어 실패 지점부터 재시작할 수 있다.",
    "OFFSET 페이징 중 조회 조건 값을 바꾸면 데이터가 누락된다. 정렬 키 기반 페이징이나 커서 Reader를 쓴다.",
    "부트 3에서 `@EnableBatchProcessing`을 붙이면 배치 자동 설정이 꺼진다."
  ],
  groups: [
    {
      name: "배치 기본 구조",
      compare: {
        cols: ["개념", "역할", "관계", "예시"],
        rows: [
          ["Job", "배치 작업 전체 단위", "Step 1개 이상으로 구성", "일일 정산 Job"],
          ["Step", "실제 처리·트랜잭션 단위", "Tasklet 또는 Chunk 방식", "주문 집계 Step"],
          ["JobInstance · JobExecution", "논리 실행 / 실제 시도", "Instance 1 : Execution N", "실패 후 재시작 = 새 Execution"],
          ["JobParameters", "Job 실행 입력값", "식별 파라미터로 Instance 구분", "`date=2024-01-01`"],
          ["JobRepository", "실행 메타데이터 저장", "모든 실행 상태 기록", "`BATCH_JOB_EXECUTION` 테이블"]
        ]
      },
      concepts: [
        {
          id: "spring/job",
          slug: "job",
          title: "Job",
          deep: false,
          def: "하나의 배치 작업 전체를 나타내는 최상위 단위로, 하나 이상의 Step을 순서나 조건에 따라 묶은 것이다.",
          why: "여러 처리 단계를 하나의 실행 단위로 묶어 실행 이력, 재시작, 중복 실행 여부를 함께 관리하기 위해서다.",
          how: [
            "Spring Batch 5부터 `JobBuilderFactory`, `StepBuilderFactory`는 deprecated되어 쓰지 않는다. `new JobBuilder(name, jobRepository)`처럼 JobRepository를 명시적으로 넘긴다.",
            "- `start(step).next(step)`: Step을 순서대로 실행한다.",
            "- `on(\"FAILED\").to(step)`: Step의 ExitStatus에 따라 다른 Step으로 분기한다(Flow).",
            "- `incrementer(new RunIdIncrementer())`: 실행할 때마다 `run.id` 파라미터를 올려 새 JobInstance를 만든다.",
            "스프링 부트 3에서는 `@EnableBatchProcessing` 없이 자동 설정이 JobRepository, JobLauncher 등을 등록하고, 기동 시 Job을 실행한다."
          ],
          code: "@Configuration\npublic class SettlementJobConfig {\n\n    @Bean\n    public Job settlementJob(JobRepository jobRepository, Step settlementStep) {\n        return new JobBuilder(\"settlementJob\", jobRepository)\n                .start(settlementStep)\n                .build();\n    }\n}",
          codeLang: "java",
          use: [
            "일 정산 Job을 \"주문 집계 Step → 정산 생성 Step → 결과 파일 전송 Step\"으로 구성한다.",
            "집계 Step이 데이터 없음으로 끝나면 `on(\"NO_DATA\").end()`로 후속 Step을 건너뛴다."
          ],
          warn: [
            "부트 3에서 `@EnableBatchProcessing`을 붙이면 배치 자동 설정이 물러나 기동 시 Job 실행, 스키마 초기화 같은 기능이 꺼진다. 직접 설정할 때만 붙인다."
          ],
          myth: [
            [
              "Spring Batch 5에서도 JobBuilderFactory를 주입받아 쓰면 된다.",
              "Batch 5에서 deprecated되었다. JobBuilder, StepBuilder에 JobRepository와 트랜잭션 매니저를 명시적으로 넘긴다."
            ]
          ],
          answer: "Job은 배치 작업 전체를 나타내는 최상위 단위로, 하나 이상의 Step을 순서나 조건에 따라 묶습니다. Spring Batch 5부터는 JobBuilderFactory 대신 new JobBuilder에 JobRepository를 직접 넘겨 만듭니다. 부트 3에서는 자동 설정이 기동 시 Job을 실행해 주며, @EnableBatchProcessing을 붙이면 이 자동 설정이 꺼집니다.",
          analogy: "Job이 하루치 작업 지시서라면 Step은 그 안의 개별 작업 항목입니다.",
          followUps: [
            [
              "부트 3에서 애플리케이션을 띄우면 Job이 자동 실행되는 것을 막으려면?",
              "`spring.batch.job.enabled=false`로 끄면 됩니다. 스케줄러나 API로 직접 실행하는 구조에서는 기동 시 자동 실행을 끄고 JobLauncher로 실행합니다."
            ]
          ],
          related: ["spring/step", "spring/jobrepository", "spring/jobinstance-jobexecution"]
        },
        {
          id: "spring/step",
          slug: "step",
          title: "Step",
          deep: false,
          def: "Job을 구성하는 독립적인 처리 단계로, 실제 읽기·가공·쓰기 로직과 트랜잭션 경계를 가진다.",
          why: "배치를 독립적인 단계로 나눠 단계별로 트랜잭션을 관리하고 실패한 단계부터 다시 실행하기 위해서다.",
          how: [
            "`new StepBuilder(name, jobRepository)`로 만들고, 트랜잭션 매니저도 명시적으로 넘긴다(Batch 5).",
            "- 청크 지향 Step: `chunk(size, transactionManager)`로 Reader·Processor·Writer를 조합한다.",
            "- Tasklet Step: `tasklet(tasklet, transactionManager)`로 단일 작업을 실행한다.",
            "Step 실행마다 StepExecution이 만들어져 읽은 건수, 쓴 건수, 커밋 횟수, 스킵 건수가 메타데이터 테이블에 기록된다."
          ],
          use: [
            "주문 데이터를 읽어 정산 데이터로 쓰는 청크 Step과, 처리 후 임시 테이블을 비우는 Tasklet Step을 나눈다.",
            "StepExecution의 readCount, writeCount, skipCount로 배치 결과를 모니터링한다."
          ],
          answer: "Step은 Job을 구성하는 독립적인 처리 단계로, 실제 비즈니스 로직과 트랜잭션 경계를 가집니다. 대량 데이터는 청크 지향 Step, 단일 작업은 Tasklet Step으로 만듭니다. Step마다 StepExecution이 기록되어 읽기·쓰기 건수와 상태를 확인할 수 있습니다.",
          followUps: [
            [
              "Step을 잘게 나누면 좋은 점은?",
              "재시작할 때 완료된 Step은 건너뛰므로 실패 범위가 줄어들고, Step별로 실행 시간과 건수가 기록되어 병목을 찾기 쉽습니다. 또 Step 단위로 병렬 실행이나 조건 분기를 걸 수 있습니다."
            ]
          ],
          related: ["spring/job", "spring/cheongkeu-jihyang-cheori", "spring/tasklet"]
        },
        {
          id: "spring/jobinstance-jobexecution",
          slug: "jobinstance-jobexecution",
          title: "JobInstance · JobExecution",
          deep: true,
          def: "JobInstance는 Job과 식별 파라미터 조합으로 구분되는 논리적 실행 단위이고, JobExecution은 그 JobInstance를 실제로 한 번 실행한 시도다.",
          why: "같은 날짜 정산을 두 번 돌리는 사고를 막고, 실패한 실행을 이어서 재시작하려면 \"어떤 작업\"과 \"몇 번째 시도\"를 구분해 기록해야 하기 때문이다.",
          how: [
            "`settlementJob` + `date=2024-01-01`이 하나의 JobInstance다. 날짜가 바뀌면 새 JobInstance가 된다.",
            "1) JobLauncher가 Job과 JobParameters를 받으면 JobRepository에서 같은 JobInstance가 있는지 조회한다.",
            "2) 없으면 새 JobInstance를 만들고, 있으면 마지막 JobExecution의 상태를 확인한다.",
            "3) 이전 실행이 COMPLETED면 `JobInstanceAlreadyCompleteException`, 아직 실행 중이면 `JobExecutionAlreadyRunningException`이 난다.",
            "4) FAILED·STOPPED면 같은 JobInstance 아래 새 JobExecution을 만들어 재시작한다.",
            "- BatchStatus: 프레임워크가 쓰는 실행 상태(STARTED, COMPLETED, FAILED 등).",
            "- ExitStatus: 실행 종료 코드로, Flow 분기 조건에 쓰고 사용자가 바꿀 수 있다."
          ],
          flow: [
            "Job + JobParameters로 실행 요청",
            "JobInstance 조회",
            "없으면 새 JobInstance 생성",
            "이전 실행 상태 확인",
            "COMPLETED면 예외, FAILED면 새 JobExecution",
            "Step 실행 후 상태 기록"
          ],
          code: "// 같은 파라미터로 두 번 실행하면\nJobParameters params = new JobParametersBuilder()\n        .addLocalDate(\"date\", LocalDate.of(2024, 1, 1))\n        .toJobParameters();\n\njobLauncher.run(settlementJob, params); // JobInstance #1, JobExecution #1 -> COMPLETED\njobLauncher.run(settlementJob, params); // JobInstanceAlreadyCompleteException\n\n// 실패했다면 같은 파라미터로 다시 실행 -> JobInstance #1, JobExecution #2 (재시작)",
          codeLang: "java",
          use: [
            "1월 1일 정산이 실패하면 같은 date 파라미터로 다시 실행해 이어서 처리한다.",
            "실수로 이미 성공한 날짜를 다시 실행하면 JobInstanceAlreadyCompleteException으로 막힌다."
          ],
          warn: ["`RunIdIncrementer`를 무심코 붙이면 매번 새 JobInstance가 만들어져 같은 날짜 데이터를 중복 처리하고, 실패 지점부터의 재시작도 되지 않는다."],
          myth: [
            [
              "JobExecution이 실패하면 JobInstance도 새로 만들어진다.",
              "같은 식별 파라미터로 다시 실행하면 같은 JobInstance에 새 JobExecution이 추가된다."
            ]
          ],
          answer: "JobInstance는 Job 이름과 식별 파라미터로 구분되는 논리적 작업이고, JobExecution은 그 작업을 실제로 실행한 한 번의 시도입니다. 실패하면 같은 JobInstance 아래 새 JobExecution을 만들어 재시작하고, 이미 완료된 JobInstance는 다시 실행할 수 없습니다. 이 구조 덕분에 중복 실행을 막고 실패 지점부터 이어서 처리할 수 있습니다.",
          analogy: "시험 과목이 JobInstance라면 응시 기록이 JobExecution입니다. 떨어지면 같은 과목에 다시 응시할 수 있지만, 합격한 과목은 다시 볼 수 없습니다.",
          qa: [
            "JobInstance와 JobExecution의 차이는 무엇인가요?",
            "JobInstance는 Job 이름과 식별 파라미터로 구분되는 논리적 작업이고, JobExecution은 그 작업을 실제로 실행한 한 번의 시도입니다. 하나의 JobInstance는 실패 후 재시작하면 여러 JobExecution을 가질 수 있지만, 성공한 JobInstance는 다시 실행할 수 없습니다. 이 구분 덕분에 중복 실행을 막고 실패한 작업을 이어서 재시작할 수 있습니다."
          ],
          followUps: [
            [
              "BatchStatus와 ExitStatus는 어떻게 다른가요?",
              "BatchStatus는 프레임워크가 관리하는 실행 상태로 COMPLETED, FAILED 같은 정해진 값입니다. ExitStatus는 종료 코드 성격의 값으로 사용자가 리스너에서 바꿀 수 있고, Job Flow에서 다음 Step을 고르는 조건으로 씁니다."
            ],
            [
              "성공한 Job을 같은 파라미터로 다시 돌려야 하면 어떻게 하나요?",
              "식별 파라미터를 달리해야 합니다. 재처리 차수 같은 값을 파라미터로 추가하거나, 해당 Step에 allowStartIfComplete를 두는 방법이 있습니다. 다만 데이터가 중복 처리되지 않게 Writer를 멱등하게 만드는 것이 먼저입니다."
            ]
          ],
          related: [
            "spring/jobparameters",
            "spring/batch-jaesijak",
            "spring/jungbok-silhaeng-bangji",
            "spring/metadeiteo-teibeul"
          ]
        },
        {
          id: "spring/jobparameters",
          slug: "jobparameters",
          title: "JobParameters",
          deep: false,
          def: "Job 실행 시 외부에서 넘기는 파라미터 묶음으로, 식별 파라미터는 JobInstance를 구분하는 키가 된다.",
          why: "같은 Job이라도 처리 기준 날짜 등에 따라 실행을 구분해, 같은 작업의 중복 실행을 막고 재시작 대상을 식별하기 위해서다.",
          how: [
            "Batch 5부터 `LocalDate`, `LocalDateTime` 등 임의 타입을 지원하며, 명령행에서는 `date=2024-01-01,java.time.LocalDate` 형식으로 넘긴다.",
            "- 식별 파라미터(identifying, 기본값): JobInstance 구분에 쓰인다.",
            "- 비식별 파라미터: `name=value,type,false`처럼 지정하며 JobInstance 구분에 쓰이지 않는다. 실행 옵션 전달에 쓴다.",
            "`@StepScope`, `@JobScope` 빈에서 `@Value(\"#{jobParameters['date']}\")`로 늦은 바인딩해 받는다."
          ],
          code: "@Bean\n@StepScope\npublic JdbcPagingItemReader<Order> orderReader(\n        @Value(\"#{jobParameters['date']}\") LocalDate date) {\n    // 실행 시점에 넘어온 date로 조회 조건을 만든다\n}",
          codeLang: "java",
          use: [
            "처리 기준 날짜를 `date` 식별 파라미터로 넘겨 날짜별로 하나의 JobInstance가 되게 한다.",
            "청크 크기나 알림 여부 같은 실행 옵션은 비식별 파라미터로 넘긴다."
          ],
          warn: [
            "`@StepScope` 빈은 프록시로 만들어지므로 반환 타입을 `ItemReader`처럼 인터페이스로 두면 `ItemStream` 콜백(open, update)이 호출되지 않을 수 있다. 구현 클래스 타입으로 반환한다."
          ],
          myth: [["파라미터는 모두 JobInstance 구분에 쓰인다.", "비식별(identifying=false) 파라미터는 JobInstance 구분에 쓰이지 않는다."]],
          answer: "JobParameters는 Job 실행 시 외부에서 넘기는 값으로, 식별 파라미터는 JobInstance를 구분하는 키가 됩니다. Batch 5부터 LocalDate 같은 다양한 타입을 쓸 수 있고, 식별 여부도 파라미터마다 정할 수 있습니다. 빈에서는 @StepScope와 SpEL로 실행 시점에 받아 씁니다.",
          followUps: [
            [
              "@StepScope는 왜 필요한가요?",
              "파라미터는 실행 시점에 결정되는데 일반 싱글톤 빈은 기동 시점에 만들어집니다. @StepScope를 붙이면 Step이 실행될 때 빈이 만들어져 jobParameters 값을 주입받을 수 있고, Step마다 별도 인스턴스라 파티셔닝에서 Worker별 값을 받을 때도 씁니다."
            ]
          ],
          related: ["spring/jobinstance-jobexecution", "spring/jenkins-baechi-silhaeng"]
        },
        {
          id: "spring/jobrepository",
          slug: "jobrepository",
          title: "JobRepository",
          deep: false,
          def: "Job과 Step의 실행 정보(JobInstance, JobExecution, StepExecution, ExecutionContext)를 DB에 저장하고 조회하는 저장소다.",
          why: "배치가 중간에 죽어도 어디까지 처리했는지 남겨 두어 처음부터가 아니라 실패 지점부터 재시작하기 위해서다.",
          how: [
            "모든 Step 실행과 청크 커밋마다 상태를 갱신하므로, 서버가 죽어도 어디까지 처리했는지 남는다.",
            "Batch 5에서 Map 기반 인메모리 JobRepository는 제거되었다. 테스트에는 H2 같은 내장 DB를 쓴다(5.2부터는 메타데이터를 남기지 않는 `ResourcelessJobRepository`도 있다).",
            "새 JobExecution을 만들 때 기본 격리 수준을 SERIALIZABLE로 써서 여러 서버가 동시에 같은 JobInstance를 시작하지 못하게 한다.",
            "부트 3에서는 데이터소스와 트랜잭션 매니저를 이용해 자동 등록된다."
          ],
          use: [
            "배치 모니터링 화면에서 메타데이터 테이블을 조회해 실행 이력과 실패 원인을 보여 준다.",
            "여러 서버가 같은 DB의 JobRepository를 공유해 같은 Job이 동시에 시작되지 않게 한다."
          ],
          answer: "JobRepository는 JobInstance, JobExecution, StepExecution, ExecutionContext를 DB에 저장하는 저장소입니다. 청크가 커밋될 때마다 상태를 갱신하므로 서버가 죽어도 어디까지 처리했는지 남습니다. Batch 5에서는 Map 기반 저장소가 제거되어 테스트에도 내장 DB를 씁니다.",
          analogy: "배치의 블랙박스입니다. 언제 시작해서 어디까지 처리하다 멈췄는지 모두 기록합니다.",
          followUps: [
            [
              "배치 메타데이터 DB와 업무 DB를 분리할 수 있나요?",
              "가능합니다. 다만 메타데이터와 업무 데이터가 서로 다른 트랜잭션으로 커밋되므로, 업무 데이터는 커밋됐는데 메타데이터 갱신이 실패하는 경우를 고려해 Writer를 멱등하게 만들어야 합니다."
            ]
          ],
          related: ["spring/metadeiteo-teibeul", "spring/teuraenjaeksyeon-maenijeo", "spring/jungbok-silhaeng-bangji"]
        }
      ]
    },
    {
      name: "청크 처리",
      compare: {
        cols: ["기준", "청크 지향 처리", "Tasklet"],
        rows: [
          ["구성", "Reader · Processor · Writer", "execute() 하나"],
          ["트랜잭션", "청크마다 커밋", "execute() 호출마다 커밋"],
          ["재시작 지점", "마지막 커밋한 청크 이후", "Step 처음부터"],
          ["적합한 작업", "대량 데이터 읽기 · 가공 · 쓰기", "삭제, 파일 정리, 프로시저 호출 같은 단일 작업"]
        ]
      },
      concepts: [
        {
          id: "spring/cheongkeu-jihyang-cheori",
          slug: "cheongkeu-jihyang-cheori",
          title: "청크 지향 처리",
          deep: true,
          def: "데이터를 한 건씩 읽고 가공한 뒤, 정해진 개수(청크)만큼 모아 한 번에 쓰고 커밋하는 Spring Batch의 기본 처리 방식이다.",
          why: "100만 건을 한 트랜잭션으로 처리하면 실패 시 전부 롤백되고 메모리도 부족해지며, 한 건씩 커밋하면 너무 느리다. 청크 단위로 커밋하면 실패 범위를 줄이면서 처리량도 확보할 수 있다.",
          how: [
            "1) 트랜잭션을 시작한다.",
            "2) ItemReader가 청크 크기만큼 한 건씩 읽는다. null을 반환하면 데이터 끝이다.",
            "3) ItemProcessor가 읽은 아이템을 한 건씩 가공하거나 걸러낸다.",
            "4) ItemWriter가 가공된 아이템 묶음(`Chunk`)을 한 번에 쓴다.",
            "5) 커밋하고 StepExecution의 읽기·쓰기 건수와 ExecutionContext(읽은 위치)를 저장한다. 데이터가 끝날 때까지 반복한다.",
            "청크 중간에 예외가 나면 그 청크만 롤백되고, 이전에 커밋된 청크는 유지된다.",
            "청크 크기는 보통 100~1000 사이에서 처리 시간과 메모리, 실패 시 재처리량을 보며 정한다. 페이징 Reader는 페이지 크기를 청크 크기와 맞춘다."
          ],
          flow: ["트랜잭션 시작", "Reader가 청크 크기만큼 읽기", "Processor가 한 건씩 가공", "Writer가 묶어서 쓰기", "커밋 + 읽은 위치 저장", "데이터 끝까지 반복"],
          code: "@Bean\npublic Step settlementStep(JobRepository jobRepository,\n                           PlatformTransactionManager transactionManager) {\n    return new StepBuilder(\"settlementStep\", jobRepository)\n            .<Order, Settlement>chunk(500, transactionManager) // 500건마다 커밋\n            .reader(orderReader(null))\n            .processor(settlementProcessor())\n            .writer(settlementWriter())\n            .build();\n}",
          codeLang: "java",
          use: [
            "전날 주문 300만 건을 500건씩 읽어 정산 테이블에 JDBC 배치 INSERT로 저장한다.",
            "CSV 회원 파일을 읽어 검증 후 DB에 적재하고, 실패 시 마지막 커밋 지점부터 다시 적재한다."
          ],
          warn: [
            "청크 크기를 너무 크게 잡으면 실패 시 롤백량과 메모리 사용이 커지고, 너무 작게 잡으면 커밋과 메타데이터 갱신 비용이 커진다.",
            "Writer에서 한 건씩 저장 쿼리를 날리면 청크의 이점이 사라진다. 배치 INSERT(JDBC batch)로 묶어 쓴다."
          ],
          myth: [["청크 크기가 클수록 무조건 빠르다.", "일정 이상 커지면 메모리와 롤백 비용만 커진다. 측정하며 적정값을 찾는다."]],
          answer: "청크 지향 처리는 데이터를 한 건씩 읽고 가공한 뒤 청크 크기만큼 모아 한 번에 쓰고 커밋하는 방식입니다. 청크 하나가 하나의 트랜잭션이라 실패해도 해당 청크만 롤백되고, 커밋마다 읽은 위치가 저장되어 재시작할 수 있습니다. 전체를 한 트랜잭션으로 묶는 것보다 안전하고, 한 건씩 커밋하는 것보다 빠릅니다.",
          analogy: "이삿짐을 한 박스씩 채워 트럭에 싣는 것과 같습니다. 박스 하나가 떨어져도 그 박스만 다시 싸면 됩니다.",
          qa: [
            "청크 지향 처리에서 트랜잭션은 어떻게 걸리나요?",
            "청크 하나가 하나의 트랜잭션입니다. 청크 크기만큼 읽고 가공한 뒤 Writer가 한 번에 쓰고 커밋하며, 이때 읽은 위치도 함께 저장됩니다. 중간에 실패하면 해당 청크만 롤백되고 이전 청크는 커밋된 상태로 남기 때문에, 재시작하면 마지막 커밋 지점부터 다시 처리할 수 있습니다."
          ],
          followUps: [
            [
              "청크 크기와 페이지 크기는 왜 맞추나요?",
              "청크 하나를 채우려고 여러 페이지를 조회하거나 한 페이지를 여러 청크에 나눠 쓰면 쿼리 횟수가 늘고, JPA 페이징 Reader에서는 영속성 컨텍스트가 엇갈리는 문제가 생길 수 있습니다. 같게 두면 청크 하나에 쿼리 하나로 깔끔해집니다."
            ],
            [
              "Processor는 한 건씩, Writer는 묶어서 처리하는 이유는?",
              "가공은 아이템 단위 로직이라 한 건씩 처리하는 게 자연스럽고, 쓰기는 DB 왕복과 커밋 비용이 크므로 묶어서 한 번에 보내야 효율적이기 때문입니다."
            ]
          ],
          related: [
            "spring/itemreader",
            "spring/itemprocessor",
            "spring/itemwriter",
            "spring/tasklet",
            "spring/batch-jaesijak"
          ]
        },
        {
          id: "spring/itemreader",
          slug: "itemreader",
          title: "ItemReader",
          deep: false,
          def: "파일, DB, API 등에서 데이터를 한 건씩 읽어 오는 인터페이스로, 더 읽을 데이터가 없으면 null을 반환한다.",
          why: "파일, DB, API 등 데이터 출처가 달라도 같은 청크 처리 흐름에서 한 건씩 읽어 오기 위해서다.",
          how: [
            "- DB: `JdbcCursorItemReader`, `JdbcPagingItemReader`, `JpaPagingItemReader`, `JpaCursorItemReader`.",
            "- 파일: `FlatFileItemReader`(CSV), `JsonItemReader`, `StaxEventItemReader`(XML).",
            "대부분의 제공 Reader는 `ItemStream`도 구현해 `open`, `update`, `close`에서 읽은 위치를 ExecutionContext에 저장하고 복원한다. 이것이 재시작의 기반이다.",
            "직접 구현할 때도 재시작이 필요하면 `ItemStreamReader`를 구현해 위치를 저장한다."
          ],
          use: [
            "`FlatFileItemReader`로 제휴사 CSV 정산 파일을 읽는다.",
            "외부 API를 페이지 단위로 호출하는 커스텀 Reader를 `ItemStreamReader`로 구현해 마지막 페이지 번호를 저장한다."
          ],
          answer: "ItemReader는 데이터 소스에서 한 건씩 읽어 오는 인터페이스이고, null을 반환하면 데이터 끝으로 판단합니다. DB, 파일, JSON, XML용 구현체가 제공됩니다. 대부분 ItemStream을 함께 구현해 읽은 위치를 ExecutionContext에 저장하므로 재시작이 가능합니다.",
          followUps: [
            [
              "커스텀 Reader를 만들 때 주의할 점은?",
              "데이터가 끝나면 반드시 null을 반환해야 Step이 끝나고, 재시작이 필요하면 ItemStream의 update에서 위치를 저장하고 open에서 복원해야 합니다. 또 Reader 빈은 @StepScope로 두어 실행마다 상태가 초기화되게 합니다."
            ]
          ],
          related: ["spring/keoseo-giban-reader", "spring/peijing-giban-reader", "spring/executioncontext"]
        },
        {
          id: "spring/itemprocessor",
          slug: "itemprocessor",
          title: "ItemProcessor",
          deep: false,
          def: "읽은 아이템을 가공·검증·변환하는 단계로, null을 반환하면 그 아이템은 Writer로 넘어가지 않고 걸러진다.",
          why: "읽기와 쓰기 사이의 가공, 검증, 필터링 로직을 분리해 재사용하고 테스트하기 쉽게 하기 위해서다.",
          how: [
            "입력 타입과 출력 타입이 달라도 되어 `Order`를 `Settlement`로 변환할 수 있다.",
            "걸러진 건수는 StepExecution의 `filterCount`로 기록된다.",
            "여러 처리를 나누려면 `CompositeItemProcessor`로 연결한다.",
            "선택 사항이라 가공이 필요 없으면 생략한다."
          ],
          code: "@Bean\npublic ItemProcessor<Order, Settlement> settlementProcessor() {\n    return order -> {\n        if (order.isCanceled()) return null; // 필터링\n        return Settlement.from(order);\n    };\n}",
          codeLang: "java",
          use: ["취소된 주문은 null을 반환해 정산 대상에서 제외한다.", "`CompositeItemProcessor`로 검증 → 변환 → 마스킹을 차례로 연결한다."],
          warn: ["Processor 안에서 아이템마다 DB나 외부 API를 조회하면 N번의 호출이 생겨 느려진다. Reader에서 조인해 가져오거나 Writer에서 묶어 처리한다."],
          answer: "ItemProcessor는 읽은 아이템을 가공, 검증, 변환하는 단계로, null을 반환하면 그 아이템은 걸러져 Writer로 가지 않습니다. 입력과 출력 타입을 다르게 할 수 있어 엔티티를 정산 결과로 바꾸는 데 씁니다. 필요 없으면 생략할 수 있습니다.",
          followUps: [
            [
              "Processor에서 예외를 던지는 것과 null을 반환하는 것은 어떻게 다른가요?",
              "null은 정상적인 필터링으로 filterCount에 기록되고 Step은 계속 진행됩니다. 예외는 skip 설정이 없으면 청크가 롤백되고 Step이 실패합니다. 업무상 제외 대상이면 null, 잘못된 데이터면 예외와 skip을 씁니다."
            ]
          ],
          related: ["spring/cheongkeu-jihyang-cheori", "spring/itemwriter"]
        },
        {
          id: "spring/itemwriter",
          slug: "itemwriter",
          title: "ItemWriter",
          deep: false,
          def: "가공된 아이템을 청크 단위로 묶어 DB, 파일, 메시지 등으로 한 번에 내보내는 인터페이스다.",
          why: "아이템을 한 건씩 쓰지 않고 청크 단위로 묶어 한 번에 저장해 대량 데이터의 쓰기 성능을 높이기 위해서다.",
          how: [
            "Batch 5부터 `write(Chunk<? extends T> chunk)`로 시그니처가 바뀌었다(이전에는 `List`).",
            "- `JdbcBatchItemWriter`: JDBC 배치 INSERT/UPDATE로 묶어서 써 가장 빠르다.",
            "- `JpaItemWriter`: EntityManager로 `merge`(또는 `persist`)한다.",
            "- `FlatFileItemWriter`: CSV 등 파일로 쓴다.",
            "- `CompositeItemWriter`, `ClassifierCompositeItemWriter`: 여러 대상에 쓰거나 아이템별로 Writer를 고른다."
          ],
          use: [
            "`JdbcBatchItemWriter`로 정산 결과 500건을 한 번의 JDBC 배치로 INSERT한다.",
            "`ClassifierCompositeItemWriter`로 정상 건과 보류 건을 다른 테이블에 나눠 쓴다."
          ],
          warn: ["JPA에서 ID 생성 전략이 IDENTITY면 INSERT를 묶지 못해 한 건씩 실행된다. 대량 INSERT는 `JdbcBatchItemWriter`를 쓴다."],
          myth: [
            [
              "JpaItemWriter를 쓰면 자동으로 배치 INSERT가 된다.",
              "IDENTITY 전략이면 묶이지 않고, 그 외에도 `hibernate.jdbc.batch_size` 설정이 있어야 묶인다."
            ]
          ],
          answer: "ItemWriter는 가공된 아이템을 청크 단위로 묶어 한 번에 내보내는 인터페이스입니다. Batch 5부터는 List 대신 Chunk를 인자로 받습니다. 대량 INSERT에는 JDBC 배치를 쓰는 JdbcBatchItemWriter가 가장 빠릅니다.",
          followUps: [
            [
              "Writer에서 예외가 나면 어떻게 되나요?",
              "해당 청크 전체가 롤백됩니다. skip이 설정되어 있으면 청크를 한 건씩 다시 처리해 문제 아이템만 찾아 건너뛰고, 없으면 Step이 실패하며 재시작 시 그 청크부터 다시 처리합니다."
            ]
          ],
          related: ["spring/cheongkeu-jihyang-cheori", "spring/jpa"]
        },
        {
          id: "spring/tasklet",
          slug: "tasklet",
          title: "Tasklet",
          deep: false,
          def: "청크 구조 없이 Step 안에서 하나의 작업을 실행하는 단순한 처리 방식이다.",
          why: "파일 삭제나 단일 쿼리 실행처럼 읽기·가공·쓰기 구조가 필요 없는 단순 작업을 가볍게 처리하기 위해서다.",
          how: [
            "`execute()`가 `RepeatStatus.FINISHED`를 반환하면 끝나고, `CONTINUABLE`이면 다시 호출된다.",
            "`execute()` 한 번이 하나의 트랜잭션으로 실행된다.",
            "오래된 데이터 일괄 삭제, 파일 정리, 집계 프로시저 호출, 알림 발송처럼 읽기·쓰기 반복이 아닌 단일 작업에 쓴다."
          ],
          code: "@Bean\npublic Step cleanupStep(JobRepository jobRepository, PlatformTransactionManager tm) {\n    return new StepBuilder(\"cleanupStep\", jobRepository)\n            .tasklet((contribution, chunkContext) -> {\n                logRepository.deleteOlderThan(LocalDate.now().minusDays(90));\n                return RepeatStatus.FINISHED;\n            }, tm)\n            .build();\n}",
          codeLang: "java",
          use: ["정산 Job 마지막에 90일 지난 임시 데이터를 삭제하는 Tasklet Step을 둔다.", "처리 결과 파일을 SFTP로 전송하는 Step을 Tasklet으로 만든다."],
          warn: ["대량 데이터를 Tasklet 하나에서 반복문으로 처리하면 전체가 한 트랜잭션이 되어 실패 시 모두 롤백되고 재시작 지점도 없다. 대량 처리는 청크 지향으로 바꾼다."],
          answer: "Tasklet은 청크 구조 없이 Step 안에서 하나의 작업을 실행하는 방식입니다. execute가 FINISHED를 반환하면 끝나고, 호출 한 번이 하나의 트랜잭션입니다. 오래된 데이터 삭제나 파일 정리처럼 읽기·쓰기 반복이 아닌 작업에 씁니다.",
          analogy: "청크가 공장 컨베이어 벨트라면, Tasklet은 한 번에 끝내는 단발성 작업입니다.",
          followUps: [
            [
              "Tasklet으로 대량 삭제를 하면 문제가 없나요?",
              "한 번에 수백만 건을 지우면 트랜잭션이 커져 락과 언두 로그가 크게 늘어납니다. 일정 건수씩 지우고 CONTINUABLE을 반환해 반복 호출되게 하면 호출마다 커밋되어 부담이 줄어듭니다."
            ]
          ],
          related: ["spring/cheongkeu-jihyang-cheori", "spring/step"]
        }
      ]
    },
    {
      name: "대용량 읽기",
      compare: {
        cols: ["기준", "커서 기반 Reader", "페이징 기반 Reader"],
        rows: [
          ["쿼리 실행", "한 번 실행 후 스트리밍", "페이지마다 실행"],
          ["커넥션", "Step 내내 점유", "페이지마다 짧게 사용"],
          ["스레드 안전", "아니다(동기화 래퍼 필요)", "안전하다"],
          ["데이터 변경 영향", "누락 없음", "OFFSET 방식은 누락 가능"],
          ["주의점", "DB 타임아웃, MySQL 스트리밍 설정", "고유 정렬 키 필수, OFFSET 성능 저하"]
        ]
      },
      concepts: [
        {
          id: "spring/keoseo-giban-reader",
          slug: "keoseo-giban-reader",
          title: "커서 기반 Reader",
          deep: false,
          def: "DB 커넥션 하나를 Step 내내 열어 두고 결과 집합을 스트리밍하듯 한 건씩 가져오는 Reader다.",
          why: "대량 데이터를 쿼리 한 번으로 스트리밍해 페이징의 반복 쿼리 비용과 데이터 누락 문제를 피하기 위해서다.",
          how: [
            "`JdbcCursorItemReader`, `JpaCursorItemReader`(4.3+), `HibernateCursorItemReader`가 있다.",
            "쿼리를 한 번만 실행하고 `fetchSize`만큼씩 네트워크로 받아 오므로 페이징보다 빠르고, 데이터가 중간에 바뀌어도 누락이 생기지 않는다.",
            "MySQL은 기본적으로 결과를 모두 메모리에 올리므로 `useCursorFetch=true` 같은 드라이버 설정을 함께 써야 스트리밍된다."
          ],
          use: [
            "수백만 건을 단일 스레드로 순서대로 처리하는 집계 배치에 `JdbcCursorItemReader`를 쓴다.",
            "MySQL에서는 `useCursorFetch=true`와 fetchSize를 함께 설정해 메모리에 전부 올라오지 않게 한다."
          ],
          warn: [
            "Step이 끝날 때까지 커넥션을 점유하므로 처리 시간이 길면 DB 타임아웃이나 커넥션 풀 고갈이 생길 수 있다.",
            "스레드 안전하지 않아 멀티스레드 Step에서는 `SynchronizedItemStreamReader`로 감싸야 한다."
          ],
          myth: [["커서 Reader는 fetchSize만 주면 어느 DB에서나 스트리밍된다.", "MySQL 드라이버는 기본적으로 결과 전체를 메모리에 올리므로 별도 설정이 필요하다."]],
          answer: "커서 기반 Reader는 쿼리를 한 번 실행하고 DB 커넥션을 열어 둔 채 결과를 스트리밍하듯 한 건씩 가져옵니다. 쿼리가 한 번뿐이라 빠르고 처리 중 데이터가 바뀌어도 누락이 없습니다. 대신 Step 내내 커넥션을 점유하고 스레드 안전하지 않다는 점을 주의해야 합니다.",
          analogy: "빨대를 꽂아 두고 계속 빨아들이는 방식입니다. 빠르지만 빨대(커넥션)를 끝까지 물고 있어야 합니다.",
          followUps: [
            [
              "커서 Reader에서 처리 시간이 길면 생기는 문제는?",
              "커넥션을 오래 열어 두므로 DB의 wait_timeout이나 소켓 타임아웃에 걸려 끊어질 수 있습니다. 처리가 오래 걸리는 배치라면 타임아웃을 늘리거나 페이징 Reader로 바꿉니다."
            ]
          ],
          related: ["spring/peijing-giban-reader", "spring/meoltiseuredeu-step"]
        },
        {
          id: "spring/peijing-giban-reader",
          slug: "peijing-giban-reader",
          title: "페이징 기반 Reader",
          deep: true,
          def: "정해진 페이지 크기만큼 쿼리를 나눠 실행하며 읽는 Reader로, 페이지마다 커넥션을 짧게 쓰고 반납한다.",
          why: "커서처럼 커넥션을 오래 잡지 않아 처리 시간이 긴 배치에서도 안정적이고, 스레드 안전해 멀티스레드 Step에 쓸 수 있기 때문이다.",
          how: [
            "1) 첫 페이지 쿼리를 실행해 pageSize만큼 가져와 메모리에 둔다.",
            "2) `read()`가 호출될 때마다 메모리에서 한 건씩 꺼낸다.",
            "3) 페이지를 다 쓰면 다음 페이지 쿼리를 실행한다. 결과가 비면 끝이다.",
            "- `JpaPagingItemReader`: OFFSET/LIMIT 방식이라 뒤 페이지로 갈수록 느려진다.",
            "- `JdbcPagingItemReader`: 정렬 키(`sortKeys`)를 기준으로 \"마지막 키보다 큰 것\"을 조회하는 방식이라 OFFSET 비용이 없다.",
            "정렬 기준은 반드시 고유한 컬럼(PK 등)이어야 페이지 경계에서 중복·누락이 생기지 않는다."
          ],
          flow: ["첫 페이지 쿼리 실행", "결과를 메모리에 보관", "read()마다 한 건씩 반환", "페이지 소진 시 다음 페이지 쿼리", "빈 결과면 종료"],
          code: "@Bean\n@StepScope\npublic JdbcPagingItemReader<Order> orderReader(DataSource dataSource,\n        @Value(\"#{jobParameters['date']}\") LocalDate date) {\n    return new JdbcPagingItemReaderBuilder<Order>()\n            .name(\"orderReader\")\n            .dataSource(dataSource)\n            .selectClause(\"select id, amount, status\")\n            .fromClause(\"from orders\")\n            .whereClause(\"where order_date = :date\")\n            .parameterValues(Map.of(\"date\", date))\n            .sortKeys(Map.of(\"id\", Order.ASCENDING)) // 고유 정렬 키 필수\n            .pageSize(500)                           // 청크 크기와 맞춘다\n            .rowMapper(new DataClassRowMapper<>(Order.class))\n            .build();\n}",
          codeLang: "java",
          use: [
            "`JdbcPagingItemReader`에 PK를 정렬 키로 주고 pageSize를 청크 크기와 같게 둔다.",
            "멀티스레드 Step에서 Reader를 공유해야 할 때 페이징 Reader를 쓴다."
          ],
          warn: ["조회 조건 컬럼을 Writer에서 바꾸면 다음 페이지의 OFFSET이 밀려 데이터가 누락된다(페이징 데이터 누락 문제)."],
          myth: [["JdbcPagingItemReader도 OFFSET으로 페이지를 넘긴다.", "정렬 키의 마지막 값보다 큰 것을 조회하는 방식이라 OFFSET 비용이 없다."]],
          answer: "페이징 기반 Reader는 페이지 크기만큼 쿼리를 나눠 실행하고 페이지마다 커넥션을 짧게 쓰고 반납합니다. 스레드 안전해 멀티스레드 Step에 쓸 수 있고 오래 걸리는 배치에서도 안정적입니다. OFFSET 방식은 뒤로 갈수록 느려지고 데이터 누락이 생길 수 있어, 정렬 키 기반인 JdbcPagingItemReader를 주로 씁니다.",
          analogy: "책을 한 장씩 넘기며 읽는 것과 같습니다. 그런데 누가 앞 장을 찢어 가면 페이지 번호가 밀려 한 장을 건너뛰게 됩니다.",
          qa: [
            "커서 Reader와 페이징 Reader는 어떻게 골라 쓰나요?",
            "커서는 쿼리를 한 번만 실행해 빠르고 데이터 변경에 따른 누락이 없지만, Step 내내 커넥션을 잡고 있고 스레드 안전하지 않습니다. 페이징은 페이지마다 커넥션을 짧게 쓰고 스레드 안전해 오래 걸리는 배치나 멀티스레드 Step에 적합합니다. 다만 OFFSET 방식은 뒤로 갈수록 느려지고 데이터가 바뀌면 누락이 생길 수 있어, 정렬 키 기반의 JdbcPagingItemReader를 주로 씁니다."
          ],
          followUps: [
            [
              "정렬 키를 고유하지 않은 컬럼으로 주면 어떻게 되나요?",
              "같은 값이 페이지 경계에 걸치면 일부가 중복으로 읽히거나 누락됩니다. PK처럼 고유한 컬럼을 쓰거나 고유 컬럼을 정렬 키에 추가합니다."
            ],
            [
              "JpaPagingItemReader의 단점은?",
              "OFFSET 기반이라 페이지가 뒤로 갈수록 느려지고, 조건 컬럼을 수정하면 누락이 생깁니다. 또 페이지마다 엔티티를 영속성 컨텍스트에 올리므로 대량 처리에서는 JDBC 기반 Reader가 더 빠릅니다."
            ]
          ],
          related: [
            "spring/keoseo-giban-reader",
            "spring/peijing-deiteo-nurak-munje",
            "spring/cheongkeu-jihyang-cheori"
          ]
        },
        {
          id: "spring/peijing-deiteo-nurak-munje",
          slug: "peijing-deiteo-nurak-munje",
          title: "페이징 데이터 누락 문제",
          deep: false,
          def: "OFFSET 기반 페이징으로 읽으면서 조회 조건에 쓰인 값을 수정하면, 다음 페이지 기준이 밀려 일부 데이터를 건너뛰는 문제다.",
          why: "조회 조건에 쓰인 값을 수정하며 OFFSET 페이징으로 읽으면 데이터가 조용히 절반가량 처리되지 않을 수 있기 때문이다.",
          how: [
            "예를 들어 `status = READY`인 주문을 100건씩 읽어 `DONE`으로 바꾸면, 첫 페이지 100건이 조건에서 빠져 두 번째 쿼리의 `OFFSET 100`은 원래 201번째부터 읽게 된다. 결과적으로 절반 정도만 처리된다.",
            "- 정렬 키 기반 조회: `JdbcPagingItemReader`나 직접 만든 No-Offset Reader로 \"마지막 id보다 큰 것\"을 조회한다.",
            "- 항상 첫 페이지 읽기: 처리된 건이 조건에서 빠지는 구조라면 페이지 번호를 항상 0으로 고정한다.",
            "- 커서 Reader 사용: 쿼리를 한 번만 실행하므로 영향이 없다.",
            "- 조회 조건 분리: 처리 결과를 다른 테이블에 쓰거나 조건과 무관한 컬럼만 수정한다."
          ],
          flow: ["1페이지(1~100) 읽고 DONE으로 변경", "조건에서 100건 빠짐", "2페이지 OFFSET 100 조회", "원래 201번째부터 읽힘", "101~200 누락"],
          use: [
            "미처리 주문을 처리 완료로 바꾸는 배치에서 Reader를 id 기반 No-Offset 방식으로 바꿔 누락을 없앤다.",
            "처리 건이 조건에서 빠지는 구조라 페이지 번호를 항상 0으로 고정한 Reader를 쓴다."
          ],
          warn: ["테스트 데이터가 페이지 크기보다 적으면 문제가 드러나지 않는다. 페이지 크기보다 많은 데이터로 검증한다."],
          myth: [["테스트에서 잘 돌았으니 누락은 없다.", "데이터가 페이지 크기보다 적으면 한 페이지로 끝나 문제가 드러나지 않는다."]],
          answer: "OFFSET 페이징으로 읽으면서 조회 조건 컬럼을 수정하면, 처리한 건이 조건에서 빠져 다음 페이지의 OFFSET이 밀리고 데이터를 건너뜁니다. 예를 들어 READY 상태를 읽어 DONE으로 바꾸면 절반 정도만 처리됩니다. 정렬 키 기반 조회, 커서 Reader, 항상 첫 페이지 읽기 같은 방법으로 해결합니다.",
          followUps: [
            [
              "항상 첫 페이지를 읽는 방식의 위험은?",
              "어떤 아이템이 처리 중 실패하거나 필터링되어 조건에서 빠지지 않으면 같은 데이터를 계속 읽어 무한 루프가 될 수 있습니다. 그래서 정렬 키 기반 조회가 더 안전한 기본값입니다."
            ]
          ],
          related: ["spring/peijing-giban-reader", "spring/keoseo-giban-reader"]
        }
      ]
    },
    {
      name: "실패 처리",
      compare: {
        cols: ["기준", "Batch 스킵", "Batch 재시도", "Batch 재시작"],
        rows: [
          ["단위", "아이템", "아이템(청크 안)", "Job · Step"],
          ["목적", "불량 데이터 건너뛰기", "일시적 오류 극복", "실패 지점부터 이어서 처리"],
          ["설정", "faultTolerant().skip()", "faultTolerant().retry()", "같은 JobParameters로 재실행"],
          ["대상 예외", "검증 실패, 파싱 오류", "데드락, 타임아웃", "Step을 실패시킨 모든 예외"]
        ]
      },
      concepts: [
        {
          id: "spring/batch-seukip",
          slug: "batch-seukip",
          title: "Batch 스킵",
          deep: false,
          def: "특정 예외가 난 아이템을 건너뛰고 Step을 계속 진행하게 하는 내결함성(fault tolerant) 기능이다.",
          why: "잘못된 데이터 몇 건 때문에 수백만 건짜리 배치 전체가 멈추는 것을 막기 위해서다.",
          how: [
            "`.faultTolerant().skip(예외).skipLimit(n)`으로 설정하며, 스킵 건수가 한도를 넘으면 Step이 실패한다.",
            "- Reader·Processor에서 예외: 해당 아이템만 빼고 계속 진행한다.",
            "- Writer에서 예외: 어느 아이템이 문제인지 모르므로 청크를 롤백한 뒤 아이템을 한 건씩 다시 처리·쓰기(스캔)해 문제 아이템만 스킵한다.",
            "`SkipListener`로 스킵된 아이템을 별도 테이블이나 로그에 남겨 나중에 재처리한다."
          ],
          code: ".<Order, Settlement>chunk(500, transactionManager)\n.reader(reader).processor(processor).writer(writer)\n.faultTolerant()\n.skip(InvalidOrderException.class)\n.skipLimit(100)\n.listener(new FailedOrderSkipListener())",
          codeLang: "java",
          use: [
            "제휴사 파일에서 형식이 잘못된 줄은 `FlatFileParseException`으로 스킵하고 SkipListener로 오류 테이블에 기록한다.",
            "스킵이 100건을 넘으면 데이터 자체에 문제가 있다고 보고 Step을 실패시킨다."
          ],
          warn: ["스킵된 데이터는 조용히 사라지기 쉽다. 반드시 SkipListener로 기록하고 모니터링한다."],
          myth: [["skip을 걸면 Writer 예외도 해당 아이템만 바로 빠진다.", "청크 전체를 롤백한 뒤 한 건씩 다시 쓰는 스캔 과정을 거치므로 처리량이 크게 떨어질 수 있다."]],
          answer: "skip은 특정 예외가 난 아이템을 건너뛰고 Step을 계속 진행하게 하는 기능입니다. faultTolerant 뒤에 skip할 예외와 skipLimit을 지정하고, 한도를 넘으면 Step이 실패합니다. Writer에서 예외가 나면 청크를 롤백한 뒤 한 건씩 다시 처리해 문제 아이템만 걸러냅니다.",
          analogy: "택배 분류 중 주소가 틀린 상자만 따로 빼 두고 나머지는 계속 분류하는 것과 같습니다.",
          followUps: [
            [
              "skip 설정 시 Processor가 여러 번 호출될 수 있나요?",
              "네. Writer 예외로 롤백되면 청크 아이템을 다시 처리하면서 Processor가 다시 호출될 수 있습니다. 그래서 Processor는 외부 부수 효과 없이 멱등하게 만들거나 processorNonTransactional 설정을 검토합니다."
            ]
          ],
          related: ["spring/batch-jaesido", "spring/batch-riseuneo"]
        },
        {
          id: "spring/batch-jaesido",
          slug: "batch-jaesido",
          title: "Batch 재시도",
          deep: false,
          def: "일시적인 오류(락 경합, 네트워크 타임아웃)가 난 아이템을 같은 청크 안에서 다시 시도하게 하는 내결함성 기능이다.",
          why: "락 경합이나 네트워크 타임아웃처럼 잠깐 뒤면 성공할 일시적 오류로 Step이 실패하는 것을 막기 위해서다.",
          how: [
            "`.faultTolerant().retry(예외).retryLimit(n)`으로 설정하며, `backOffPolicy`로 재시도 간격을 줄 수 있다.",
            "Processor와 Writer에 적용되며 Reader의 예외는 재시도하지 않는다.",
            "재시도 한도를 넘으면 skip이 설정된 예외는 스킵하고, 아니면 Step이 실패한다.",
            "데드락, 낙관적 락 실패처럼 다시 하면 성공할 수 있는 예외에만 건다."
          ],
          use: [
            "정산 Writer에서 `DeadlockLoserDataAccessException`이 나면 3번까지 재시도한다.",
            "외부 환율 API를 호출하는 Processor에 타임아웃 예외 재시도와 백오프를 건다."
          ],
          warn: ["검증 실패처럼 다시 해도 똑같이 실패하는 예외를 재시도하면 시간만 낭비한다. 이런 예외는 skip 대상이다."],
          answer: "retry는 데드락이나 타임아웃처럼 일시적인 오류가 난 아이템을 다시 시도하는 기능입니다. faultTolerant 뒤에 retry할 예외와 retryLimit을 지정하며, Processor와 Writer에 적용되고 Reader 예외는 재시도하지 않습니다. 한도를 넘으면 skip 대상이면 건너뛰고, 아니면 Step이 실패합니다.",
          followUps: [
            [
              "Batch retry와 Spring Retry의 @Retryable은 어떻게 다른가요?",
              "Batch retry는 청크 처리 흐름에 통합되어 재시도 실패 시 skip이나 롤백과 연결됩니다. @Retryable은 일반 메서드 호출 단위의 재시도입니다. 배치 아이템 처리에는 Batch의 retry 설정을 쓰는 것이 청크 트랜잭션과 맞물려 안전합니다."
            ]
          ],
          related: ["spring/batch-seukip", "spring/batch-jaesijak"]
        },
        {
          id: "spring/batch-jaesijak",
          slug: "batch-jaesijak",
          title: "Batch 재시작",
          deep: true,
          def: "실패하거나 중지된 JobInstance를 같은 JobParameters로 다시 실행해, 이미 완료된 부분은 건너뛰고 실패 지점부터 이어서 처리하는 기능이다.",
          why: "수백만 건 중 마지막에 실패했을 때 처음부터 다시 돌리면 시간이 낭비되고, 이미 처리된 데이터를 중복 처리할 위험이 있기 때문이다.",
          how: [
            "1) 실패한 Job을 같은 식별 파라미터로 다시 실행하면 같은 JobInstance 아래 새 JobExecution이 만들어진다.",
            "2) 이전에 COMPLETED된 Step은 건너뛴다(`allowStartIfComplete(true)`면 다시 실행).",
            "3) 실패한 Step은 마지막 StepExecution의 ExecutionContext에서 읽은 위치(마지막 커밋 지점)를 복원한다.",
            "4) Reader가 그 위치부터 읽어 실패한 청크부터 다시 처리한다.",
            "- `preventRestart()`: 재시작을 막는다.",
            "- `startLimit(n)`: Step의 최대 실행 횟수를 제한한다."
          ],
          flow: [
            "같은 JobParameters로 재실행",
            "같은 JobInstance에 새 JobExecution",
            "완료된 Step 건너뜀",
            "실패한 Step의 ExecutionContext 복원",
            "마지막 커밋 이후부터 처리"
          ],
          code: "// 첫 실행: 3,000건까지 커밋 후 실패 -> FAILED\n// 같은 파라미터로 재실행하면 3,001번째부터 처리\njava -jar batch.jar --spring.batch.job.name=settlementJob date=2024-01-01,java.time.LocalDate\n\n@Bean\npublic Step settlementStep(...) {\n    return new StepBuilder(\"settlementStep\", jobRepository)\n            .<Order, Settlement>chunk(500, tm)\n            .reader(orderReader(null))   // ItemStream이 읽은 위치를 저장\n            .writer(settlementWriter())\n            .startLimit(3)               // 최대 3번까지 실행\n            .build();\n}",
          codeLang: "java",
          use: [
            "300만 건 중 250만 건째에서 DB 장애로 실패한 정산을 장애 복구 후 같은 날짜로 다시 실행해 나머지만 처리한다.",
            "외부 파일 전송 Step처럼 다시 실행하면 안 되는 Step은 완료 후 재실행되지 않게 기본값을 유지한다."
          ],
          warn: [
            "프로세스를 강제 종료(kill -9)하면 JobExecution이 STARTED로 남아 재시작이 막힌다. 메타데이터의 상태를 FAILED로, 종료 시간을 채워 정리한 뒤 재실행한다.",
            "`saveState(false)`인 Reader나 멀티스레드 Step은 읽은 위치가 저장되지 않아 이어서 재시작할 수 없다. 처리 여부 플래그 등으로 멱등하게 만든다."
          ],
          myth: [["재시작하면 실패한 아이템부터 정확히 다시 시작한다.", "마지막으로 커밋된 청크 다음부터 시작한다. 실패한 청크 전체를 다시 처리한다."]],
          answer: "Spring Batch는 청크가 커밋될 때마다 읽은 위치를 ExecutionContext에 저장합니다. 실패한 Job을 같은 파라미터로 다시 실행하면 같은 JobInstance로 인식해 완료된 Step은 건너뛰고, 실패한 Step은 저장된 위치부터 이어서 처리합니다. 강제 종료로 STARTED 상태가 남으면 메타데이터를 FAILED로 정리해야 재시작할 수 있습니다.",
          analogy: "게임의 세이브 포인트와 같습니다. 죽으면 처음이 아니라 마지막 저장 지점부터 다시 시작합니다.",
          qa: [
            "Spring Batch는 어떻게 실패한 지점부터 재시작하나요?",
            "청크가 커밋될 때마다 Reader가 읽은 위치를 ExecutionContext에 저장하고, 이 정보가 JobRepository를 통해 메타데이터 테이블에 남습니다. 같은 파라미터로 다시 실행하면 같은 JobInstance로 인식해 완료된 Step은 건너뛰고, 실패한 Step은 저장된 위치를 복원해 마지막 커밋 이후부터 처리합니다."
          ],
          followUps: [
            [
              "배치 프로세스가 kill -9로 죽으면 어떻게 재시작하나요?",
              "JobExecution이 STARTED로 남아 있어 실행 중으로 판단되므로 그대로는 재시작되지 않습니다. 메타데이터 테이블에서 해당 JobExecution과 StepExecution의 상태를 FAILED로, 종료 시간을 채워 정리한 뒤 같은 파라미터로 다시 실행합니다."
            ],
            [
              "재시작이 불가능한 경우는?",
              "Reader가 saveState(false)이거나 멀티스레드 Step처럼 읽은 위치가 저장되지 않는 경우, preventRestart를 설정한 경우, startLimit을 넘은 경우입니다. 이때는 처리 여부 플래그 등으로 멱등하게 만들어 처음부터 다시 돌려도 안전하게 합니다."
            ]
          ],
          related: ["spring/executioncontext", "spring/jobinstance-jobexecution", "spring/metadeiteo-teibeul"]
        },
        {
          id: "spring/executioncontext",
          slug: "executioncontext",
          title: "ExecutionContext",
          deep: false,
          def: "Job이나 Step 실행 중 상태를 키-값으로 저장해 재시작이나 Step 간 데이터 전달에 쓰는 저장소다.",
          why: "재시작할 때 이전에 읽은 위치를 이어받고, Step 사이에 필요한 값을 전달하기 위해서다.",
          how: [
            "- StepExecution의 ExecutionContext: Step 범위로, Reader의 읽은 위치 등이 청크 커밋마다 저장된다.",
            "- JobExecution의 ExecutionContext: Job 범위로, 여러 Step이 공유한다.",
            "Step에서 만든 값을 다음 Step에 넘기려면 `ExecutionContextPromotionListener`로 Job 범위로 올린다.",
            "직렬화되어 메타데이터 테이블에 저장된다."
          ],
          use: [
            "첫 Step에서 계산한 대상 건수를 Job ExecutionContext로 올려 마지막 Step의 검증에 쓴다.",
            "파티셔닝에서 Partitioner가 각 파티션의 minId, maxId를 ExecutionContext에 담아 Worker에 넘긴다."
          ],
          warn: ["대량 데이터나 큰 객체를 넣으면 커밋마다 직렬화·저장 비용이 커진다. 위치나 ID 같은 작은 값만 넣는다."],
          answer: "ExecutionContext는 Job이나 Step 실행 중 상태를 키-값으로 저장하는 저장소입니다. Step 범위에는 Reader가 읽은 위치가 청크 커밋마다 저장되어 재시작에 쓰이고, Job 범위는 여러 Step이 값을 공유할 때 씁니다. 직렬화되어 DB에 저장되므로 작은 값만 넣어야 합니다.",
          followUps: [
            [
              "Step ExecutionContext의 값을 다음 Step에서 읽으려면?",
              "Step 범위 값은 다른 Step에서 보이지 않으므로 ExecutionContextPromotionListener로 지정한 키를 Job ExecutionContext로 올리거나, 처음부터 Job ExecutionContext에 넣습니다."
            ]
          ],
          related: ["spring/batch-jaesijak", "spring/metadeiteo-teibeul"]
        }
      ]
    },
    {
      name: "확장",
      compare: {
        cols: ["기준", "멀티스레드 Step", "Step 파티셔닝", "원격 청킹"],
        rows: [
          ["병렬 단위", "청크", "데이터 범위(파티션)", "청크(메시지)"],
          ["실행 위치", "한 JVM", "한 JVM 또는 원격", "여러 서버"],
          ["Reader", "공유(스레드 안전 필요)", "파티션마다 독립", "Manager 하나"],
          ["재시작", "어렵다", "파티션별 가능", "구성 복잡"],
          ["구성 난이도", "낮다", "중간", "높다(메시징 필요)"]
        ]
      },
      concepts: [
        {
          id: "spring/meoltiseuredeu-step",
          slug: "meoltiseuredeu-step",
          title: "멀티스레드 Step",
          deep: false,
          def: "하나의 Step에 TaskExecutor를 지정해 청크를 여러 스레드가 동시에 처리하게 하는 가장 간단한 병렬화 방식이다.",
          why: "단일 스레드로는 처리 시간이 너무 긴 Step을 코드 변경을 최소화하면서 병렬로 빠르게 처리하기 위해서다.",
          how: [
            "`.taskExecutor(executor)`만 추가하면 각 스레드가 청크 하나씩을 맡아 읽기·가공·쓰기를 한다.",
            "Reader, Processor, Writer가 모두 스레드 안전해야 한다. 페이징 Reader는 안전하고, 커서 Reader는 `SynchronizedItemStreamReader`로 감싼다.",
            "Batch 5에서 `throttleLimit`은 deprecated되었고, 동시성은 TaskExecutor의 스레드 풀 크기로 조절한다."
          ],
          use: [
            "외부 API 호출 때문에 느린 Processor를 스레드 8개로 병렬화해 처리 시간을 줄인다.",
            "`JdbcPagingItemReader`에 `saveState(false)`를 주고 처리 여부 플래그로 재실행을 안전하게 만든다."
          ],
          warn: [
            "여러 스레드가 섞여 읽으므로 처리 순서가 보장되지 않고, 읽은 위치를 정확히 저장할 수 없어 Reader에 `saveState(false)`를 준다. 재시작이 필요하면 파티셔닝을 쓴다."
          ],
          myth: [["스레드를 늘리면 비례해서 빨라진다.", "DB 커넥션 풀, DB 락 경합이 병목이 되면 오히려 느려진다. 커넥션 풀 크기도 스레드 수에 맞춰야 한다."]],
          answer: "멀티스레드 Step은 Step에 TaskExecutor를 지정해 여러 스레드가 청크를 나눠 처리하는 가장 간단한 병렬화 방식입니다. Reader, Processor, Writer가 모두 스레드 안전해야 해서 페이징 Reader를 쓰거나 커서 Reader를 동기화 래퍼로 감쌉니다. 읽은 위치를 정확히 저장할 수 없어 재시작이 어렵다는 한계가 있습니다.",
          analogy: "한 상자의 물건을 여러 사람이 동시에 꺼내 포장하는 것과 같습니다. 빠르지만 누가 어디까지 했는지 기록하기 어렵습니다.",
          followUps: [
            [
              "멀티스레드 Step에서 커넥션 풀은 어떻게 잡아야 하나요?",
              "각 스레드가 청크 트랜잭션마다 커넥션을 쓰고, 페이징 Reader도 쿼리 시 커넥션을 쓰므로 최소 스레드 수 이상으로 잡아야 합니다. 부족하면 커넥션을 기다리다 타임아웃이 납니다."
            ]
          ],
          related: ["spring/step-patisyeoning", "spring/peijing-giban-reader", "spring/bidonggi-seuredeu-pul"]
        },
        {
          id: "spring/step-patisyeoning",
          slug: "step-patisyeoning",
          title: "Step 파티셔닝",
          deep: true,
          def: "데이터를 범위별로 나누고(파티션), 파티션마다 독립된 Worker Step을 병렬로 실행하는 확장 방식이다.",
          why: "멀티스레드 Step은 Reader를 공유해 순서와 재시작이 보장되지 않는다. 파티셔닝은 각 Worker가 자기 범위만 읽고 자기 StepExecution을 가지므로 병렬로 빠르면서도 파티션별 재시작이 가능하다.",
          how: [
            "1) Manager Step의 `Partitioner`가 데이터를 나눌 기준(예: id 1~10만, 10만~20만)을 담은 ExecutionContext를 gridSize만큼 만든다.",
            "2) `PartitionHandler`(로컬은 `TaskExecutorPartitionHandler`)가 각 파티션을 Worker Step으로 실행한다.",
            "3) Worker Step은 `@StepScope`로 자기 파티션의 범위 값을 받아 그 범위만 읽고 쓴다.",
            "4) 모든 Worker가 끝나면 Manager가 결과를 모아 Step 상태를 정한다. 실패한 파티션만 재시작된다.",
            "원격 파티셔닝은 같은 구조에서 파티션 정보만 메시지로 다른 서버의 Worker에 보낸다."
          ],
          flow: [
            "Manager Step 시작",
            "Partitioner가 범위별 ExecutionContext 생성",
            "PartitionHandler가 Worker Step 실행",
            "Worker가 자기 범위만 처리",
            "결과 취합 후 Step 상태 결정"
          ],
          code: "@Bean\npublic Step managerStep(JobRepository jobRepository, Step workerStep) {\n    return new StepBuilder(\"managerStep\", jobRepository)\n            .partitioner(\"workerStep\", new IdRangePartitioner(orderRepository))\n            .step(workerStep)\n            .gridSize(8)\n            .taskExecutor(new SimpleAsyncTaskExecutor())\n            .build();\n}\n\n@Bean\n@StepScope\npublic JdbcPagingItemReader<Order> workerReader(\n        @Value(\"#{stepExecutionContext['minId']}\") Long minId,\n        @Value(\"#{stepExecutionContext['maxId']}\") Long maxId) {\n    // where id between :minId and :maxId\n}",
          codeLang: "java",
          use: ["1,000만 건 정산을 id 범위로 8개 파티션으로 나눠 처리 시간을 8분의 1 가까이 줄인다.", "가맹점 그룹별로 파티션을 나눠 실패한 그룹만 재처리한다."],
          warn: ["id 범위로 단순 분할하면 중간에 삭제된 구간 때문에 파티션별 데이터 양이 크게 달라질 수 있다. 실제 분포를 보고 나눈다."],
          answer: "파티셔닝은 Partitioner가 데이터를 범위별로 나누고, 파티션마다 독립된 Worker Step을 병렬로 실행하는 방식입니다. 각 Worker가 자기 범위만 읽고 자기 StepExecution을 가지므로 멀티스레드 Step과 달리 파티션별 재시작이 가능합니다. 같은 구조로 Worker를 다른 서버에 두는 원격 파티셔닝으로도 확장할 수 있습니다.",
          analogy: "시험지 채점을 1~100번, 101~200번처럼 나눠 여러 채점자에게 맡기는 것과 같습니다. 한 사람이 실수하면 그 묶음만 다시 채점합니다.",
          qa: [
            "멀티스레드 Step과 파티셔닝의 차이는 무엇인가요?",
            "멀티스레드 Step은 하나의 Reader를 여러 스레드가 공유해 청크를 나눠 처리하므로 간단하지만, Reader가 스레드 안전해야 하고 읽은 위치를 저장할 수 없어 재시작이 어렵습니다. 파티셔닝은 데이터를 범위로 나눠 각 Worker Step이 자기 범위만 독립적으로 처리하고 각자 StepExecution을 가지므로, 실패한 파티션만 재시작할 수 있고 원격 서버로도 확장할 수 있습니다."
          ],
          followUps: [
            [
              "gridSize는 어떻게 정하나요?",
              "파티션 개수 힌트로, 보통 동시에 돌릴 스레드나 Worker 수와 같거나 조금 크게 잡습니다. DB가 감당할 수 있는 동시 쿼리 수와 커넥션 풀 크기를 넘지 않게 정합니다."
            ],
            [
              "원격 파티셔닝과 원격 청킹의 차이는?",
              "원격 파티셔닝은 범위 정보만 메시지로 보내고 Worker가 직접 읽기·쓰기를 해 네트워크 부담이 적습니다. 원격 청킹은 Manager가 읽은 아이템 자체를 보내므로 데이터 양만큼 네트워크 부하가 생깁니다."
            ]
          ],
          related: ["spring/meoltiseuredeu-step", "spring/wongyeok-cheongking", "spring/executioncontext"]
        },
        {
          id: "spring/wongyeok-cheongking",
          slug: "wongyeok-cheongking",
          title: "원격 청킹",
          deep: false,
          def: "Manager가 데이터를 읽어 청크를 메시지로 보내고, 여러 서버의 Worker가 가공과 쓰기를 맡는 분산 처리 방식이다.",
          why: "가공과 쓰기가 무거워 한 서버로는 처리량이 부족할 때 여러 서버로 부하를 나누기 위해서다.",
          how: [
            "Spring Batch Integration(`@EnableBatchIntegration`)과 Kafka·RabbitMQ 같은 메시징 미들웨어로 구성한다.",
            "읽기는 빠르지만 가공·쓰기가 무거운 경우(복잡한 계산, 외부 호출)에 효과가 있다.",
            "아이템 데이터 자체가 네트워크로 오가므로 데이터가 크면 네트워크가 병목이 된다. 이때는 범위 정보만 보내는 원격 파티셔닝이 낫다."
          ],
          use: [
            "이미지 변환처럼 아이템당 연산이 무거운 작업을 여러 Worker 서버로 분산한다.",
            "Manager는 DB에서 ID만 읽어 보내고 Worker가 무거운 계산과 저장을 한다."
          ],
          answer: "원격 청킹은 Manager가 데이터를 읽어 청크를 메시지로 보내고, 여러 서버의 Worker가 가공과 쓰기를 맡는 방식입니다. Spring Batch Integration과 메시징 미들웨어로 구성합니다. 읽기는 가볍고 가공이 무거울 때 효과가 있지만 아이템이 네트워크로 오가므로 데이터가 크면 원격 파티셔닝이 낫습니다.",
          followUps: [
            [
              "원격 청킹에서 Worker가 죽으면 어떻게 되나요?",
              "Manager는 보낸 청크의 응답을 기다리다 타임아웃이 나면 Step을 실패 처리합니다. 메시지 브로커의 내구성 설정과 Writer의 멱등성을 함께 갖춰야 재처리 시 중복이 생기지 않습니다."
            ]
          ],
          related: ["spring/step-patisyeoning"]
        }
      ]
    },
    {
      name: "운영",
      compare: {
        cols: ["기준", "스케줄러 연동 실행", "Jenkins 배치 실행"],
        rows: [
          ["프로세스", "항상 떠 있음", "실행마다 새 JVM"],
          ["이력 · 알림", "직접 구현", "Jenkins 기능 활용"],
          ["다중 서버", "분산 락 필요", "실행 노드 하나로 지정"],
          ["파라미터 입력 · 수동 실행", "별도 API 필요", "빌드 파라미터 화면 제공"]
        ]
      },
      concepts: [
        {
          id: "spring/seukejulreo-yeondong-silhaeng",
          slug: "seukejulreo-yeondong-silhaeng",
          title: "스케줄러 연동 실행",
          deep: false,
          def: "애플리케이션 안의 스케줄러(`@Scheduled`, Quartz)가 정해진 시각에 JobLauncher로 Job을 실행하는 방식이다.",
          why: "별도 외부 도구 없이 애플리케이션 안에서 정해진 시각에 배치를 자동으로 실행하기 위해서다.",
          how: [
            "배치 애플리케이션이 계속 떠 있으면서 cron 표현식에 따라 `jobLauncher.run(job, params)`을 호출한다.",
            "실행 날짜나 시각을 JobParameters로 넘겨 실행마다 다른 JobInstance가 되게 한다.",
            "서버가 여러 대면 같은 시각에 모두 실행되므로 ShedLock 같은 분산 락이나 JobInstance 중복 검사로 한 번만 실행되게 한다.",
            "Batch 6(부트 4)에서는 `JobLauncher`가 deprecated되고 `JobOperator`로 실행하는 방식이 권장된다."
          ],
          code: "@Scheduled(cron = \"0 0 2 * * *\")\npublic void runSettlement() throws Exception {\n    JobParameters params = new JobParametersBuilder()\n            .addLocalDate(\"date\", LocalDate.now().minusDays(1))\n            .toJobParameters();\n    jobLauncher.run(settlementJob, params);\n}",
          codeLang: "java",
          use: ["매일 새벽 2시에 전날 날짜를 파라미터로 정산 Job을 실행한다.", "다중 인스턴스 환경에서 ShedLock으로 한 서버에서만 스케줄이 돌게 한다."],
          warn: ["실행 이력, 실패 알림, 수동 재실행 화면을 직접 만들어야 한다. 배치가 많아지면 Jenkins 같은 외부 실행 도구가 관리에 유리하다."],
          answer: "스케줄러 연동은 애플리케이션 안의 @Scheduled나 Quartz가 정해진 시각에 JobLauncher로 Job을 실행하는 방식입니다. 설정이 간단하지만 앱이 항상 떠 있어야 하고, 서버가 여러 대면 분산 락으로 한 번만 실행되게 해야 합니다. 실행 이력, 알림, 수동 재실행 기능도 직접 만들어야 합니다.",
          followUps: [
            [
              "@Scheduled로 배치를 돌릴 때 주의할 점은?",
              "기본 스케줄러 스레드가 하나라 배치가 길면 다른 스케줄이 밀립니다. 스케줄러 스레드 풀을 늘리거나 비동기로 실행하고, 다중 서버라면 분산 락과 JobInstance 중복 검사를 함께 둡니다."
            ]
          ],
          related: ["spring/scheduled", "spring/bunsan-seukejul-rak", "spring/jenkins-baechi-silhaeng"]
        },
        {
          id: "spring/jenkins-baechi-silhaeng",
          slug: "jenkins-baechi-silhaeng",
          title: "Jenkins 배치 실행",
          deep: false,
          def: "Jenkins 같은 외부 도구가 배치 JAR를 Job 이름과 파라미터를 붙여 실행하고, 끝나면 프로세스가 종료되는 방식이다.",
          why: "실행 이력, 로그, 실패 알림, 수동 재실행 화면을 직접 만들지 않고 검증된 도구로 배치를 운영하기 위해서다.",
          how: [
            "`java -jar batch.jar --spring.batch.job.name=settlementJob date=2024-01-01,java.time.LocalDate`처럼 실행한다. 부트 3은 Job이 여러 개면 `spring.batch.job.name`을 지정해야 한다.",
            "Jenkins의 cron 트리거, 실행 이력, 콘솔 로그, 실패 알림, 파라미터 입력 화면을 그대로 활용한다.",
            "`System.exit(SpringApplication.exit(SpringApplication.run(...)))`로 Job 실패를 0이 아닌 종료 코드로 돌려 Jenkins가 실패로 인식하게 한다.",
            "실행마다 새 JVM이 뜨므로 메모리 누수가 쌓이지 않고 배치별로 힙 크기를 다르게 줄 수 있다."
          ],
          use: [
            "Jenkins 빌드 파라미터로 date를 입력받아 실패한 날짜의 배치를 수동으로 재실행한다.",
            "배치별로 Jenkins Job을 만들어 cron 트리거와 실패 시 메신저 알림을 설정한다."
          ],
          warn: ["종료 코드를 처리하지 않으면 Job이 실패해도 프로세스가 0으로 끝나 Jenkins에는 성공으로 표시된다."],
          myth: [["Job이 실패하면 Jenkins도 당연히 실패로 표시된다.", "종료 코드를 처리하지 않으면 프로세스가 0으로 끝나 성공으로 표시된다."]],
          answer: "Jenkins 같은 외부 도구로 배치 JAR를 Job 이름과 파라미터를 붙여 실행하고, 끝나면 프로세스가 종료되게 하는 방식입니다. 실행 이력, 로그, 실패 알림, 파라미터 입력 화면을 Jenkins에서 그대로 쓸 수 있습니다. Job 실패가 종료 코드로 전달되도록 SpringApplication.exit 결과로 System.exit을 호출해야 합니다.",
          analogy: "배치 애플리케이션은 도구 상자이고, Jenkins는 정해진 시간에 필요한 도구를 꺼내 쓰고 다시 넣는 관리인입니다.",
          followUps: [
            [
              "Jenkins에서 같은 배치가 동시에 실행되지 않게 하려면?",
              "Jenkins Job의 동시 빌드 허용을 끄면 이전 실행이 끝날 때까지 대기합니다. 여기에 Spring Batch의 JobInstance 중복 검사가 더해져 같은 파라미터의 이중 실행도 막힙니다."
            ]
          ],
          related: ["spring/seukejulreo-yeondong-silhaeng", "spring/jobparameters"]
        },
        {
          id: "spring/jungbok-silhaeng-bangji",
          slug: "jungbok-silhaeng-bangji",
          title: "중복 실행 방지",
          deep: false,
          def: "같은 배치가 동시에 또는 두 번 실행되어 데이터가 중복 처리되는 것을 막는 방법들이다.",
          why: "같은 배치가 두 번 실행되면 정산이나 포인트 지급이 중복되어 금전적 사고로 이어지기 때문이다.",
          how: [
            "- JobInstance 검사: 같은 식별 파라미터로 이미 COMPLETED면 `JobInstanceAlreadyCompleteException`, 실행 중이면 `JobExecutionAlreadyRunningException`이 난다.",
            "- 파라미터 설계: 처리 기준 날짜처럼 업무적으로 의미 있는 값을 식별 파라미터로 둔다. 실행 시각을 넣으면 매번 새 JobInstance가 되어 방지 효과가 사라진다.",
            "- 실행 단 제어: 스케줄러 분산 락, Jenkins의 동시 빌드 금지 옵션으로 실행 자체를 하나로 제한한다.",
            "- 멱등한 Writer: 처리 여부 플래그나 UPSERT로 다시 실행돼도 결과가 같게 만든다."
          ],
          use: [
            "정산 Job의 식별 파라미터를 처리 날짜 하나로 두어 같은 날짜가 두 번 처리되지 않게 한다.",
            "Writer를 UPSERT로 만들어 재처리되더라도 결과가 중복되지 않게 한다."
          ],
          warn: ["`RunIdIncrementer`는 매 실행마다 새 JobInstance를 만들어 JobInstance 기반 중복 방지를 무력화한다."],
          myth: [
            [
              "RunIdIncrementer를 쓰면 안전하게 재실행할 수 있다.",
              "매번 새 JobInstance가 만들어져 중복 실행을 막지 못하고 실패 지점부터의 재시작도 되지 않는다."
            ]
          ],
          answer: "가장 기본은 JobInstance 검사로, 같은 식별 파라미터로 이미 성공했거나 실행 중이면 예외가 나 실행되지 않습니다. 이를 위해 처리 기준 날짜처럼 업무적으로 의미 있는 값을 식별 파라미터로 둡니다. 여기에 스케줄러 분산 락이나 Jenkins 동시 빌드 금지, 멱등한 Writer를 더해 이중으로 막습니다.",
          followUps: [
            [
              "서버 두 대가 동시에 같은 Job을 시작하면 어떻게 되나요?",
              "JobRepository가 JobExecution을 만들 때 기본으로 SERIALIZABLE 격리 수준을 써서 하나만 성공하고 다른 하나는 예외가 납니다. 다만 파라미터에 실행 시각이 들어가 서로 다른 JobInstance가 되면 막히지 않으므로 파라미터 설계가 중요합니다."
            ]
          ],
          related: ["spring/jobinstance-jobexecution", "spring/bunsan-seukejul-rak", "spring/jobrepository"]
        },
        {
          id: "spring/metadeiteo-teibeul",
          slug: "metadeiteo-teibeul",
          title: "메타데이터 테이블",
          deep: false,
          def: "JobRepository가 배치 실행 이력과 상태를 저장하는 `BATCH_` 접두사의 테이블들이다.",
          why: "배치 실행 상태와 이력을 DB에 남겨 실패 원인 추적, 재시작, 중복 실행 판단의 근거로 쓰기 위해서다.",
          how: [
            "- `BATCH_JOB_INSTANCE`: Job 이름과 식별 파라미터 키.",
            "- `BATCH_JOB_EXECUTION`, `BATCH_JOB_EXECUTION_PARAMS`: 실행 시도별 상태, 시작·종료 시각, 파라미터.",
            "- `BATCH_STEP_EXECUTION`: Step별 읽기·쓰기·스킵·커밋 건수와 상태.",
            "- `BATCH_JOB_EXECUTION_CONTEXT`, `BATCH_STEP_EXECUTION_CONTEXT`: 직렬화된 ExecutionContext.",
            "스키마 스크립트는 spring-batch-core에 DB별로 들어 있고, 부트에서는 `spring.batch.jdbc.initialize-schema`(always, embedded, never)로 생성 여부를 정한다. 운영에서는 never로 두고 직접 만든다."
          ],
          use: [
            "`BATCH_STEP_EXECUTION`의 read_count, write_count, skip_count로 일별 처리 결과를 대시보드에 보여 준다.",
            "강제 종료로 STARTED에 멈춘 실행을 `BATCH_JOB_EXECUTION`에서 FAILED로 고쳐 재시작한다."
          ],
          warn: ["이력이 계속 쌓여 테이블이 커지면 조회와 실행 생성이 느려진다. 오래된 이력을 주기적으로 정리한다."],
          answer: "메타데이터 테이블은 JobRepository가 실행 이력을 저장하는 BATCH_ 접두사 테이블들입니다. JobInstance, JobExecution과 파라미터, StepExecution, 각 ExecutionContext를 저장해 재시작과 중복 실행 방지의 근거가 됩니다. 운영에서는 스키마를 직접 관리하고 오래된 이력을 주기적으로 정리합니다.",
          followUps: [
            [
              "운영에서 initialize-schema를 always로 두면 안 되는 이유는?",
              "DB 계정에 DDL 권한이 필요해지고 스키마 변경이 배포에 섞여 통제가 어렵습니다. 운영에서는 never로 두고 버전 업그레이드 시 제공되는 마이그레이션 스크립트를 직접 검토해 적용합니다."
            ]
          ],
          related: ["spring/jobrepository", "spring/executioncontext", "spring/batch-jaesijak"]
        },
        {
          id: "spring/batch-riseuneo",
          slug: "batch-riseuneo",
          title: "Batch 리스너",
          deep: false,
          def: "Job, Step, 청크, 아이템 처리의 전후 시점에 끼어들어 로깅, 알림, 실패 기록 같은 부가 작업을 하는 콜백이다.",
          why: "배치 로직을 건드리지 않고 시작·종료 로깅, 실패 알림 같은 부가 작업을 끼워 넣기 위해서다.",
          how: [
            "- `JobExecutionListener`: Job 시작·종료 시. 실패하면 메신저로 알림을 보낸다.",
            "- `StepExecutionListener`: Step 전후. `afterStep`에서 ExitStatus를 바꿔 Flow 분기에 쓴다.",
            "- `ChunkListener`: 청크 전후·에러 시.",
            "- `ItemReadListener`, `ItemProcessListener`, `ItemWriteListener`, `SkipListener`: 아이템 단위 이벤트.",
            "`@BeforeJob`, `@AfterStep` 같은 애너테이션으로도 등록할 수 있다."
          ],
          use: [
            "`afterJob`에서 상태가 FAILED면 슬랙으로 실패 원인과 JobExecution ID를 보낸다.",
            "`SkipListener`로 스킵된 주문을 오류 테이블에 쌓아 다음 날 재처리한다."
          ],
          answer: "Batch 리스너는 Job, Step, 청크, 아이템 처리 전후에 끼어드는 콜백입니다. JobExecutionListener로 실패 알림을 보내고, SkipListener로 건너뛴 데이터를 기록하며, StepExecutionListener로 ExitStatus를 바꿔 흐름을 분기합니다. 비즈니스 로직과 운영 부가 기능을 분리하는 역할을 합니다.",
          followUps: [
            [
              "리스너에서 예외가 나면 어떻게 되나요?",
              "리스너 종류와 시점에 따라 Step이나 Job이 실패할 수 있습니다. 알림 같은 부가 작업은 리스너 안에서 예외를 잡아 로그만 남기도록 해 본 처리에 영향을 주지 않게 합니다."
            ]
          ],
          related: ["spring/batch-seukip", "spring/job"]
        }
      ]
    }
  ]
};

export default topic;
