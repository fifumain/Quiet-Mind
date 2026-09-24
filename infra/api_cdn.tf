# CloudFront custom origins require a DNS name, not a bare IP. Computed
# instead of read from aws_instance.app.public_dns to avoid depending on
# attribute-refresh timing after the EIP association.
locals {
  ec2_public_dns = "ec2-${replace(aws_eip.app.public_ip, ".", "-")}.${var.aws_region}.compute.amazonaws.com"
}

resource "aws_cloudfront_distribution" "api" {
  enabled = true

  origin {
    domain_name = local.ec2_public_dns
    origin_id   = "ec2-app"

    custom_origin_config {
      http_port              = 80
      https_port              = 443
      origin_protocol_policy  = "http-only"
      origin_ssl_protocols    = ["TLSv1.2"]
      origin_read_timeout     = 60
      origin_keepalive_timeout = 5
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods          = ["GET", "HEAD"]
    target_origin_id        = "ec2-app"
    viewer_protocol_policy  = "redirect-to-https"

    # Dynamic, per-user API responses - nothing here should be cached.
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies {
        forward = "all"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  price_class = "PriceClass_100"

  tags = {
    Name = "${var.project_name}-${var.environment}-api-cdn"
  }
}
