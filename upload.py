# -*- coding: utf-8 -*-

import os
import sys
import oss2


# 以下代码展示了文件上传的高级用法，如断点续传、分片上传等。
# 基本的文件上传如上传普通文件、追加文件，请参见object_basic.py


# 首先初始化AccessKeyId、AccessKeySecret、Endpoint等信息。
# 通过环境变量获取，或者把诸如“<你的AccessKeyId>”替换成真实的AccessKeyId等。
#
# 以杭州区域为例，Endpoint可以是：
#   http://oss-cn-hangzhou.aliyuncs.com
#   https://oss-cn-hangzhou.aliyuncs.com
# 分别以HTTP、HTTPS协议访问。
access_key_id = "LTAIM5AzH0bAaTbR"#os.getenv('OSS_TEST_ACCESS_KEY_ID', '<你的AccessKeyId>')
access_key_secret = "RboxQdx0bRHPosd43eW4t4sRQge8U2"#os.getenv('OSS_TEST_ACCESS_KEY_SECRET', '<你的AccessKeySecret>')
bucket_name = "citest"#os.getenv('OSS_TEST_BUCKET', '<你的Bucket>')
endpoint = "oss-cn-beijing.aliyuncs.com"#os.getenv('OSS_TEST_ENDPOINT', '<你的访问域名>')

# 确认上面的参数都填写正确了
for param in (access_key_id, access_key_secret, bucket_name, endpoint):
    assert '<' not in param, '请设置参数：' + param

# 创建Bucket对象，所有Object相关的接口都可以通过Bucket对象来进行
bucket = oss2.Bucket(oss2.Auth(access_key_id, access_key_secret), endpoint, bucket_name)

filename = sys.argv[1]
key = sys.argv[2]

upload_id = bucket.init_multipart_upload(key).upload_id

# 也可以直接调用分片上传接口。
# 首先可以用帮助函数设定分片大小，设我们期望的分片大小为128KB
total_size = os.path.getsize(filename)
part_size = oss2.determine_part_size(total_size, preferred_size=128 * 1024)

# 创建Bucket对象，所有Object相关的接口都可以通过Bucket对象来进行
bucket = oss2.Bucket(oss2.Auth(access_key_id, access_key_secret), endpoint, bucket_name)

# 逐个上传分片
# 其中oss2.SizedFileAdapter()把fileobj转换为一个新的文件对象，新的文件对象可读的长度等于num_to_upload
with open(filename, 'rb') as fileobj:
    parts = []
    part_number = 1
    offset = 0
    while offset < total_size:
        num_to_upload = min(part_size, total_size - offset)
        result = bucket.upload_part(key, upload_id, part_number,
                                    oss2.SizedFileAdapter(fileobj, num_to_upload))
        parts.append(oss2.models.PartInfo(part_number, result.etag))

        offset += num_to_upload
        part_number += 1

    # 完成分片上传
    bucket.complete_multipart_upload(key, upload_id, parts)



# 验证一下
with open(filename, 'rb') as fileobj:
    assert bucket.get_object(key).read() == fileobj.read()
