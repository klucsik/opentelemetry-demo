package oteldemo.problempattern;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import io.grpc.ManagedChannelBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import oteldemo.Demo.GetFlagResponse;
import oteldemo.FeatureFlagServiceGrpc.FeatureFlagServiceBlockingStub;

public class CPULoad {
    private static final Logger logger = LogManager.getLogger(CPULoad.class);
    private static final int THREAD_COUNT = 4;
    private static FeatureFlagServiceBlockingStub featureFlagServiceStub = null;
    private boolean running = false;
    private final List<Logarithmizer> runningWorkers = new ArrayList<>();
    private static final String ADSERVICE_HIGH_CPU_FEATURE_FLAG = "adServiceHighCpu";
    private static CPULoad instance;
    private static final String featureFlagServiceAddr =
            Optional.ofNullable(System.getenv("FEATURE_FLAG_GRPC_SERVICE_ADDR")).orElse("");

    private CPULoad(FeatureFlagServiceBlockingStub featureFlagServiceStub) {
        CPULoad.featureFlagServiceStub = featureFlagServiceStub;
    }

    public static CPULoad getInstance() {
        if (!featureFlagServiceAddr.isEmpty()) {
            featureFlagServiceStub =
                    oteldemo.FeatureFlagServiceGrpc.newBlockingStub(
                            ManagedChannelBuilder.forTarget(featureFlagServiceAddr).usePlaintext().build());
        }
        if (instance == null) {
            instance = new CPULoad(featureFlagServiceStub);
        }
        return instance;
    }

    public Object execute() {
        if (checkAdCpuLoad()) {
            logger.info("cpuload enabled");
            if (!running) {
                spawnLoadWorkers(THREAD_COUNT);
                running = true;
            }
        } else if (!checkAdCpuLoad()){
            running = false;
            stopWorkers();
        }
        return null; //nothing to do
    }

    boolean checkAdCpuLoad() {
        if (featureFlagServiceStub == null) {
            return false;
        }

        GetFlagResponse response =
                featureFlagServiceStub.getFlag(
                        oteldemo.Demo.GetFlagRequest.newBuilder()
                                .setName(ADSERVICE_HIGH_CPU_FEATURE_FLAG)
                                .build());
        return response.getFlag().getEnabled();
    }

    private void spawnLoadWorkers(int threadCount) {
        synchronized(runningWorkers) {
            for (int i = 0; i< threadCount; i++) {
                Logarithmizer logarithmizer = new Logarithmizer();
                Thread thread = new Thread(logarithmizer);
                thread.setDaemon(true);
                thread.start();
                runningWorkers.add(logarithmizer);
            }
        }
    }

    private void stopWorkers() {
        synchronized(runningWorkers) {
            for (Logarithmizer logarithmizer : runningWorkers) {
                logarithmizer.setShouldRun(false);
            }
            runningWorkers.clear();
        }
    }

    private static class Logarithmizer implements Runnable {

        private volatile boolean shouldRun = true;

        @Override
        public void run() {
            while (shouldRun) {
                Math.log(System.currentTimeMillis());
            }
        }

        public void setShouldRun(boolean shouldRun) {
            this.shouldRun = shouldRun;
        }
    }
}
