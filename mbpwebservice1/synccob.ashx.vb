Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization

Public Class synccob
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest
        Dim db As New mbpDataContext

        Dim cob As String = context.Request.QueryString("cob")

        Dim q = From cl In db.clients
                Where cl.COBRADOR = cob
                Select New With {
                    .Cobranza = (From c In db.cobranzas
                                 Where c.CLIENTE = cl.CLIENTE
                                 Select New With {
                                     .client = c.CLIENTE,
                                     .cobId = c.COBRANZA,
                                     .cob = New With {
                                        .COBRANZA = c.COBRANZA,
                                        .CLIENTE = c.CLIENTE,
                                        .FECHA = c.CLIENTE,
                                        .NO_REFEREN = c.NO_REFEREN,
                                        .VENTA = c.VENTA,
                                        .FECHA_VENC =
                                            c.FECHA_VENC.Value.ToShortDateString,
                                        .SALDO = c.SALDO,
                                        .cobdet =
                                            From cd In db.cobdets
                                            Where cd.COBRANZA = c.COBRANZA
                                            Select New With {
                                                .id = cd.id,
                                                .COBRANZA = cd.COBRANZA,
                                                .CLIENTE = cd.CLIENTE,
                                                .NO_REFEREN = cd.NO_REFEREN,
                                                .VENTA = cd.VENTA,
                                                .IMPORTE = cd.IMPORTE,
                                                .FECHA =
                                                    cd.FECHA.Value.ToShortDateString
                                            }
                                     }
                                     }).AsEnumerable
                    }


        Dim json As New JavaScriptSerializer
        Dim result = json.Serialize(q.Single)

        context.Response.Write(result)


    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class