import CoreImage
import CoreImage.CIFilterBuiltins
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers
import Vision

let payload = "https://work.weixin.qq.com/ct/wcde518f3ee4ac1b506616d06dedf1fb6f60"
let outputPixels = 900
let quietZoneModules = 4
let outputURL = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
  .appendingPathComponent("images/contact/wecom-sales-manager-qr.png")

enum QRGenerationError: Error, LocalizedError {
  case missingOutputImage
  case unableToCreateCGImage
  case unableToCreateOpaqueImage
  case unableToCreateDestination
  case unableToWriteImage
  case unableToDecode
  case payloadMismatch(String)

  var errorDescription: String? {
    switch self {
    case .missingOutputImage:
      return "Core Image did not produce a QR image."
    case .unableToCreateCGImage:
      return "Could not rasterize the QR image."
    case .unableToCreateOpaqueImage:
      return "Could not create an opaque QR image."
    case .unableToCreateDestination:
      return "Could not create the PNG destination."
    case .unableToWriteImage:
      return "Could not write the QR PNG."
    case .unableToDecode:
      return "Vision could not decode the generated QR PNG."
    case let .payloadMismatch(value):
      return "Decoded QR payload differs from the expected URL: \(value)"
    }
  }
}

func makeQRCode() throws -> CGImage {
  let filter = CIFilter.qrCodeGenerator()
  filter.message = Data(payload.utf8)
  filter.correctionLevel = "M"

  guard let output = filter.outputImage?.transformed(by: .identity) else {
    throw QRGenerationError.missingOutputImage
  }

  let qrExtent = output.extent.integral
  let modules = Int(qrExtent.width)
  let gridModules = modules + quietZoneModules * 2

  let quietZone = CGFloat(quietZoneModules)
  let fullExtent = CGRect(
    x: 0,
    y: 0,
    width: qrExtent.width + quietZone * 2,
    height: qrExtent.height + quietZone * 2
  )
  let whiteBackground = CIImage(color: .white).cropped(to: fullExtent)
  let translatedCode = output.transformed(by: CGAffineTransform(translationX: quietZone, y: quietZone))
  let codeWithQuietZone = translatedCode.composited(over: whiteBackground)
  let scale = CGFloat(outputPixels / gridModules)
  let scaled = codeWithQuietZone.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
  let scaledPixels = gridModules * Int(scale)
  let centeringOffset = CGFloat((outputPixels - scaledPixels) / 2)
  let outputExtent = CGRect(x: 0, y: 0, width: outputPixels, height: outputPixels)
  let outputBackground = CIImage(color: .white).cropped(to: outputExtent)
  let centered = scaled.transformed(by: CGAffineTransform(translationX: centeringOffset, y: centeringOffset))
    .composited(over: outputBackground)
  let context = CIContext(options: [.cacheIntermediates: false])

  guard let image = context.createCGImage(centered, from: outputExtent) else {
    throw QRGenerationError.unableToCreateCGImage
  }
  return try makeOpaque(image)
}

func makeOpaque(_ image: CGImage) throws -> CGImage {
  let colorSpace = CGColorSpaceCreateDeviceRGB()
  let bitmapInfo = CGImageAlphaInfo.noneSkipLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue
  guard let context = CGContext(
    data: nil,
    width: image.width,
    height: image.height,
    bitsPerComponent: 8,
    bytesPerRow: 0,
    space: colorSpace,
    bitmapInfo: bitmapInfo
  ) else {
    throw QRGenerationError.unableToCreateOpaqueImage
  }

  context.interpolationQuality = .none
  context.setFillColor(red: 1, green: 1, blue: 1, alpha: 1)
  context.fill(CGRect(x: 0, y: 0, width: image.width, height: image.height))
  context.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))
  guard let opaque = context.makeImage() else {
    throw QRGenerationError.unableToCreateOpaqueImage
  }
  return opaque
}

func writePNG(_ image: CGImage, to url: URL) throws {
  try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
  guard let destination = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else {
    throw QRGenerationError.unableToCreateDestination
  }
  CGImageDestinationAddImage(destination, image, nil)
  guard CGImageDestinationFinalize(destination) else {
    throw QRGenerationError.unableToWriteImage
  }
}

func decodeQRCode(at url: URL) throws -> String {
  let request = VNDetectBarcodesRequest()
  let handler = VNImageRequestHandler(url: url, options: [:])
  try handler.perform([request])
  guard let decoded = request.results?.first?.payloadStringValue else {
    throw QRGenerationError.unableToDecode
  }
  return decoded
}

do {
  if CommandLine.arguments.contains("--verify") {
    let decoded = try decodeQRCode(at: outputURL)
    guard decoded == payload else {
      throw QRGenerationError.payloadMismatch(decoded)
    }
    print("WeCom QR verification passed: \(decoded)")
  } else {
    let image = try makeQRCode()
    guard image.width == outputPixels && image.height == outputPixels else {
      throw QRGenerationError.unableToCreateCGImage
    }
    try writePNG(image, to: outputURL)
    print("Generated WeCom QR: \(outputURL.path)")
  }
} catch {
  fputs("WeCom QR generation failed: \(error.localizedDescription)\n", stderr)
  exit(1)
}
