#ifndef AS_G711
#define AS_G711
#ifdef __cplusplus
extern "C" {
#endif
void pcm16_to_alaw(int length, const unsigned char *src_samples, unsigned char *dst_samples);
void pcm16_to_ulaw(int length, const unsigned char *src_samples, unsigned char *dst_samples);
void alaw_to_pcm16(int length, const unsigned char *src_samples, unsigned char *dst_samples);
void ulaw_to_pcm16(int length, const unsigned char *src_samples, unsigned char *dst_samples);
void alaw_to_pcm32(int length, const unsigned char *src_samples, unsigned char *dst_samples);
void ulaw_to_pcm32(int length, const unsigned char *src_samples, unsigned char *dst_samples);
#ifdef __cplusplus
}
#endif
#endif
