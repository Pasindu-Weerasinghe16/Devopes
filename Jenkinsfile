pipeline {
  agent none

  options {
    timestamps()
  }

  parameters {
    string(name: 'EC2_KEY_NAME', defaultValue: 'my-new-key', description: 'Existing AWS EC2 key pair name (Terraform var.key_name). Default is set for webhook-triggered builds.')
    string(name: 'SSH_USER', defaultValue: 'ubuntu', description: 'SSH username for the EC2 instance')
    booleanParam(name: 'DESTROY_AFTER', defaultValue: false, description: 'Destroy AWS infra after deploy')
  }

  environment {
    TF_DIR = 'terraform/aws'
    ANSIBLE_DIR = 'ansible'

    FRONTEND_DIR = 'Frount-end'
    BACKEND_DIR  = 'Back-end'

    DOCKERHUB_USER = 'dockerpasindu'
  }

  stages {
    stage('Checkout') {
      agent { label 'built-in' }
      steps {
        checkout scm
      }
    }

    stage('Build & Push Docker images') {
      agent { label 'built-in' }
      steps {
        sh '''
          set -e
          GIT_SHA=$(git rev-parse --short HEAD)
          echo "IMAGE_TAG=$GIT_SHA" > .image_tag

          docker build -t ${DOCKERHUB_USER}/devopes-fe:$GIT_SHA ./${FRONTEND_DIR}
          docker build -t ${DOCKERHUB_USER}/devopes-be:$GIT_SHA ./${BACKEND_DIR}
        '''

        withCredentials([string(credentialsId: 'docker-secret', variable: 'DOCKER_PASSWORD')]) {
          sh '''
            set -e
            GIT_SHA=$(cat .image_tag | cut -d= -f2)

            echo "$DOCKER_PASSWORD" | docker login -u "${DOCKERHUB_USER}" --password-stdin

            docker push ${DOCKERHUB_USER}/devopes-fe:$GIT_SHA
            docker push ${DOCKERHUB_USER}/devopes-be:$GIT_SHA

            docker logout
          '''
        }
      }
    }

    stage('Terraform Apply (AWS)') {
      agent { label 'built-in' }
      steps {
        withCredentials([
          string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
        ]) {
          dir("${TF_DIR}") {
            script {
              def keyName = (params.EC2_KEY_NAME ?: '').trim()
              if (!keyName) {
                keyName = 'my-new-key'
              }
              sh """
                set -e
                echo "Using EC2_KEY_NAME=${keyName}"
                terraform init -input=false
                terraform apply -auto-approve -input=false \
                  -var "key_name=${keyName}"
                terraform output -raw app_public_ip > ../../.app_ip
              """
            }
          }
        }
      }
    }

    stage('Deploy with Ansible') {
      agent { label 'built-in' }
      steps {
        withCredentials([
          sshUserPrivateKey(credentialsId: 'aws-ec2-ssh-key', keyFileVariable: 'SSH_KEY_FILE')
        ]) {
          script {
            def imageTag = sh(script: "cat .image_tag | cut -d= -f2", returnStdout: true).trim()
            def appIp = sh(script: "cat .app_ip", returnStdout: true).trim()
            def sshUser = (params.SSH_USER ?: '').trim()
            if (!sshUser) {
              sshUser = 'ubuntu'
            }
            sh """
              set -e

              mkdir -p ${ANSIBLE_DIR}/inventory
              cat > ${ANSIBLE_DIR}/inventory/hosts.ini <<EOF
              [app]
              ${appIp} ansible_user=${sshUser}
              EOF

              export DOCKERHUB_USER='${DOCKERHUB_USER}'
              export IMAGE_TAG='${imageTag}'
              export ANSIBLE_CONFIG='${ANSIBLE_DIR}/ansible.cfg'

              ansible-playbook \
                --private-key "${SSH_KEY_FILE}" \
                -i ${ANSIBLE_DIR}/inventory/hosts.ini \
                ${ANSIBLE_DIR}/playbooks/deploy.yml
            """
          }
        }
      }
    }

    stage('Terraform Destroy (optional)') {
      when { expression { return params.DESTROY_AFTER == true } }
      agent { label 'built-in' }
      steps {
        withCredentials([
          string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
        ]) {
          dir("${TF_DIR}") {
            sh '''
              set -e
              terraform init -input=false
              terraform destroy -auto-approve -input=false
            '''
          }
        }
      }
    }
  }
}
