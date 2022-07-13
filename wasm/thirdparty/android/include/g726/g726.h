#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif
void g726_encode_16(int16_t *pcm,
                    int8_t *bitstream);

void g726_decode_16(int8_t *bitstream,
                    int16_t *pcm);

void g726_encode_24(int16_t *pcm,
                    int8_t *bitstream);

void g726_decode_24(int8_t *bitstream,
                    int16_t *pcm);

void g726_encode_32(int16_t *pcm,
                    int8_t *bitstream);

void g726_decode_32(int8_t *bitstream,
                    int16_t *pcm);

void g726_encode_40(int16_t *pcm,
                    int8_t *bitstream);

void g726_decode_40(int8_t *bitstream,
                    int16_t *pcm);

#ifdef __cplusplus
}
#endif
