import { IOContext, InstanceOptions, VBase } from "@vtex/api";

export class NoCacheVBase extends VBase {
  public constructor(context: IOContext, options?: InstanceOptions) {
    super(
      context,
      {
        ...(options ?? {}),
        headers: {
          ...(options?.headers ?? {}),
          'Cache-Control': 'no-cache',
        }, 
      }
    )
  }
}