pipeline {
    agent any

    environment {
        DOCKER_USER           = "longlephanhai"           // Thay bằng Docker Hub username của bạn
        DOCKER_CREDENTIALS_ID = "docker-hub-credentials"  // ID Username/Password trong Jenkins Credentials
        IMAGE_TAG             = "${BUILD_NUMBER}"

        // ---------------------------------------------------------------------
        // Cấu hình AWS RDS MySQL
        // ---------------------------------------------------------------------
        DB_HOST               = "prod-mysql-db.cv02mk0y86bf.ap-southeast-1.rds.amazonaws.com"
        DB_PORT               = "3306"
        DB_USERNAME           = "admin"
        DB_PASSWORD           = credentials('rds-db-password') // Tạo Secret Text trong Jenkins có ID là rds-db-password
        DB_NAME               = "mysqlDatabase"
        DB_TYPE               = "mysql"
    }

    stages {
        stage('1. Checkout SCM') {
            steps {
                echo '📥 Kéo mã nguồn mới nhất từ GitHub...'
                checkout scm
            }
        }

        stage('2. Build Check & TypeScript Compile') {
            steps {
                echo '🔨 Kiểm tra biên dịch TypeScript (sử dụng container Node 22)...'
                sh '''
                    # Chạy qua Docker để không cần cài Node.js lên máy chủ Jenkins
                    docker run --rm -v "$(pwd):/app" -w /app node:22-alpine sh -c "
                        if [ -f package-lock.json ]; then
                            npm ci
                        else
                            npm install
                        fi
                        npm run build
                    "
                '''
            }
        }

        stage('3. Run Database Migration') {
            steps {
                echo '🔄 Đồng bộ hóa bảng (Table Schema) lên AWS RDS MySQL...'
                sh '''
                    docker run --rm \
                        -e DB_HOST="${DB_HOST}" \
                        -e DB_PORT="${DB_PORT}" \
                        -e DB_USERNAME="${DB_USERNAME}" \
                        -e DB_PASSWORD="${DB_PASSWORD}" \
                        -e DB_NAME="${DB_NAME}" \
                        -e DB_TYPE="${DB_TYPE}" \
                        -v "$(pwd):/app" -w /app node:22-alpine sh -c "
                            npm run db:migrate
                        "
                '''
            }
        }

        stage('4. Build Docker Images') {
            steps {
                echo '🐳 Building Docker images for all 7 Microservices...'
                sh """
                    docker build -f docker/Dockerfile.brand -t ${DOCKER_USER}/express-brand:${IMAGE_TAG} -t ${DOCKER_USER}/express-brand:latest .
                    docker build -f docker/Dockerfile.category -t ${DOCKER_USER}/express-category:${IMAGE_TAG} -t ${DOCKER_USER}/express-category:latest .
                    docker build -f docker/Dockerfile.product -t ${DOCKER_USER}/express-product:${IMAGE_TAG} -t ${DOCKER_USER}/express-product:latest .
                    docker build -f docker/Dockerfile.user -t ${DOCKER_USER}/express-user:${IMAGE_TAG} -t ${DOCKER_USER}/express-user:latest .
                    docker build -f docker/Dockerfile.cart -t ${DOCKER_USER}/express-cart:${IMAGE_TAG} -t ${DOCKER_USER}/express-cart:latest .
                    docker build -f docker/Dockerfile.order -t ${DOCKER_USER}/express-order:${IMAGE_TAG} -t ${DOCKER_USER}/express-order:latest .
                    docker build -f docker/Dockerfile.gateway -t ${DOCKER_USER}/express-gateway:${IMAGE_TAG} -t ${DOCKER_USER}/express-gateway:latest .
                """
            }
        }

        stage('5. Push Images to Docker Hub') {
            steps {
                echo '🚀 Đăng nhập và đẩy Images lên Docker Hub...'
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'DOCKER_HUB_USER', passwordVariable: 'DOCKER_HUB_PASS')]) {
                    sh '''
                        echo "$DOCKER_HUB_PASS" | docker login -u "$DOCKER_HUB_USER" --password-stdin

                        docker push ${DOCKER_USER}/express-brand:${IMAGE_TAG}
                        docker push ${DOCKER_USER}/express-brand:latest

                        docker push ${DOCKER_USER}/express-category:${IMAGE_TAG}
                        docker push ${DOCKER_USER}/express-category:latest

                        docker push ${DOCKER_USER}/express-product:${IMAGE_TAG}
                        docker push ${DOCKER_USER}/express-product:latest

                        docker push ${DOCKER_USER}/express-user:${IMAGE_TAG}
                        docker push ${DOCKER_USER}/express-user:latest

                        docker push ${DOCKER_USER}/express-cart:${IMAGE_TAG}
                        docker push ${DOCKER_USER}/express-cart:latest

                        docker push ${DOCKER_USER}/express-order:${IMAGE_TAG}
                        docker push ${DOCKER_USER}/express-order:latest

                        docker push ${DOCKER_USER}/express-gateway:${IMAGE_TAG}
                        docker push ${DOCKER_USER}/express-gateway:latest
                    '''
                }
            }
        }

        stage('6. Deploy Microservices') {
            steps {
                echo '🚀 Khởi động toàn bộ Microservices bằng Docker Compose...'
                sh '''
                    # Sinh file .env kết nối trực tiếp đến RDS MySQL
                    cat <<EOF > .env
PORT=3000
GATEWAY_PORT=3000
BRAND_PORT=3001
CATEGORY_PORT=3002
PRODUCT_PORT=3003
USER_PORT=3004
CART_PORT=3005
ORDER_PORT=3006

BRAND_SERVICE_URL=http://brand-service:3001
CATEGORY_SERVICE_URL=http://category-service:3002
PRODUCT_SERVICE_URL=http://product-service:3003
USER_SERVICE_URL=http://user-service:3004
CART_SERVICE_URL=http://cart-service:3005
ORDER_SERVICE_URL=http://order-service:3006

DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_TYPE=mysql
JWT_SECRET=just_jwt_secret_key
EXPIRATION_TIME=1h
EOF
                    # Chạy lại containers
                    docker compose down || true
                    docker compose up -d --build
                '''
            }
        }
    }

    post {
        always {
            echo '🧹 Dọn dẹp images tạm thời...'
            sh 'docker image prune -f || true'
        }
        success {
            echo '🎉 [CI/CD THÀNH CÔNG] Toàn bộ hệ thống microservices đã được build, migrate và chạy lên thành công!'
        }
        failure {
            echo '❌ [CI/CD THẤT BẠI] Vui lòng kiểm tra Console Output để xem chi tiết lỗi.'
        }
    }
}
